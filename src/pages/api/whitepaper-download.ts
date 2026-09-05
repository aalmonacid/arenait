import type { APIRoute } from 'astro';
import { client } from '../../lib/sanity';
import { sanityWriteClient } from '../../lib/sanityWriteClient';
import { checkRateLimit } from '../../lib/rateLimit';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface WhitepaperDownloadPayload {
  whitepaperId?: unknown;
  fullName?: unknown;
  corporateEmail?: unknown;
  company?: unknown;
  companyWebsite?: unknown; // honeypot anti-spam, debe llegar vacío
  policyAccepted?: unknown;
  policyVersion?: unknown;
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Mismo patrón que /api/leads.ts (ver el comentario extenso ahí):
  // clientAddress lo resuelve @astrojs/vercel a partir de x-forwarded-for.
  let ip: string;
  try {
    ip = context.clientAddress || 'unknown';
  } catch {
    ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  }

  const { limited, retryAfterSeconds } = checkRateLimit(ip);
  if (limited) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Demasiadas solicitudes desde este origen. Intenta de nuevo en unos minutos.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
      },
    );
  }

  let body: WhitepaperDownloadPayload;

  try {
    body = await request.json();
  } catch {
    return badRequest('El cuerpo de la solicitud debe ser JSON válido.');
  }

  const whitepaperId = typeof body.whitepaperId === 'string' ? body.whitepaperId.trim() : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const corporateEmail =
    typeof body.corporateEmail === 'string' ? body.corporateEmail.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const honeypot = typeof body.companyWebsite === 'string' ? body.companyWebsite.trim() : '';
  const policyAccepted = body.policyAccepted === true;
  const policyVersion = typeof body.policyVersion === 'string' ? body.policyVersion.trim() : '';

  if (honeypot) {
    // Bot: fingir éxito sin persistir nada ni revelar el PDF real.
    return new Response(JSON.stringify({ ok: true, id: null, pdfUrl: null }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!whitepaperId) {
    return badRequest('Falta identificar el recurso a descargar.');
  }

  if (!fullName || !corporateEmail) {
    return badRequest('Nombre completo y correo son obligatorios.');
  }

  if (!EMAIL_RE.test(corporateEmail)) {
    return badRequest('El correo no tiene un formato válido.');
  }

  if (!policyAccepted) {
    return badRequest('Debes aceptar la Política de Tratamiento de Datos Personales.');
  }

  // El PDF real solo se consulta acá, DESPUÉS de validar el formulario — la
  // página de listado (/recursos) nunca proyecta `pdfFile` en su query, así
  // que la URL de descarga no existe en ningún HTML servido antes de este
  // punto. Ver la nota en src/types/sanity.ts (WhitepaperSchema.pdfFile).
  let whitepaper: { title: string; pdfUrl: string | null } | null;

  try {
    whitepaper = await client.fetch<{ title: string; pdfUrl: string | null } | null>(
      `*[_type == "whitepaper" && _id == $id][0]{ title, "pdfUrl": pdfFile.asset->url }`,
      { id: whitepaperId },
    );
  } catch (error) {
    console.error('Error al consultar el whitepaper en Sanity:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'No se pudo procesar la descarga. Intente nuevamente.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!whitepaper) {
    return badRequest('El recurso solicitado ya no está disponible.');
  }

  if (!whitepaper.pdfUrl) {
    // Documento de Sanity sin archivo PDF cargado todavía — error honesto,
    // no un 404 genérico (el recurso existe, el PDF no).
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Este documento todavía no tiene un PDF cargado. Intenta de nuevo más tarde.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const doc = await sanityWriteClient.create({
      _type: 'lead',
      fullName,
      company,
      corporateEmail,
      phone: '',
      serviceOfInterest: '',
      message: `Descarga de whitepaper: "${whitepaper.title}"`,
      source: 'whitepaper-download',
      createdAt: new Date().toISOString(),
      policyAccepted,
      policyVersion,
      policyAcceptedAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ ok: true, id: doc._id, pdfUrl: whitepaper.pdfUrl }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error al guardar el lead de descarga en Sanity:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'No se pudo guardar la solicitud. Intente nuevamente.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
