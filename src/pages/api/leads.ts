import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanityWriteClient';
import { checkRateLimit } from '../../lib/rateLimit';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadPayload {
  fullName?: unknown;
  company?: unknown;
  corporateEmail?: unknown;
  phone?: unknown;
  serviceOfInterest?: unknown;
  message?: unknown;
  source?: unknown;
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

  // clientAddress lo resuelve @astrojs/vercel a partir de x-forwarded-for
  // (ver getClientIpAddress en @astrojs/internal-helpers). En local
  // (astro dev) cae a la IP del socket. Se accede dentro de un try/catch
  // porque Astro lanza un error si el adaptador en uso no soporta
  // clientAddress; en ese caso (u otro sin IP disponible), 'unknown' agrupa
  // todo ese tráfico bajo una sola clave (best-effort, ver limitación
  // documentada en src/lib/rateLimit.ts).
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

  let body: LeadPayload;

  try {
    body = await request.json();
  } catch {
    return badRequest('El cuerpo de la solicitud debe ser JSON válido.');
  }

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const corporateEmail = typeof body.corporateEmail === 'string' ? body.corporateEmail.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const serviceOfInterest =
    typeof body.serviceOfInterest === 'string' ? body.serviceOfInterest.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const source = typeof body.source === 'string' ? body.source.trim() : 'lead-capture-form';
  const honeypot = typeof body.companyWebsite === 'string' ? body.companyWebsite.trim() : '';
  const policyAccepted = body.policyAccepted === true;
  const policyVersion = typeof body.policyVersion === 'string' ? body.policyVersion.trim() : '';

  if (honeypot) {
    // Bot: fingir éxito sin persistir nada ni revelar que fue detectado.
    return new Response(JSON.stringify({ ok: true, id: null }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
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

  try {
    const doc = await sanityWriteClient.create({
      _type: 'lead',
      fullName,
      company,
      corporateEmail,
      phone,
      serviceOfInterest,
      message,
      source,
      createdAt: new Date().toISOString(),
      policyAccepted,
      policyVersion,
      policyAcceptedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true, id: doc._id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al guardar el lead en Sanity:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'No se pudo guardar la solicitud. Intente nuevamente.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
