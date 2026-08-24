import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanityWriteClient';

export const prerender = false;

const BLOCKED_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'hotmail.com',
  'yahoo.com',
  'outlook.com',
  'live.com',
  'aol.com',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadPayload {
  fullName?: unknown;
  jobTitle?: unknown;
  corporateEmail?: unknown;
  infrastructure?: unknown;
  message?: unknown;
  source?: unknown;
  companyWebsite?: unknown; // honeypot anti-spam, debe llegar vacío
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: LeadPayload;

  try {
    body = await request.json();
  } catch {
    return badRequest('El cuerpo de la solicitud debe ser JSON válido.');
  }

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const corporateEmail = typeof body.corporateEmail === 'string' ? body.corporateEmail.trim() : '';
  const jobTitle = typeof body.jobTitle === 'string' ? body.jobTitle.trim() : '';
  const infrastructure = typeof body.infrastructure === 'string' ? body.infrastructure.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const source = typeof body.source === 'string' ? body.source.trim() : 'lead-capture-form';
  const honeypot = typeof body.companyWebsite === 'string' ? body.companyWebsite.trim() : '';

  if (honeypot) {
    // Bot: fingir éxito sin persistir nada ni revelar que fue detectado.
    return new Response(JSON.stringify({ ok: true, id: null }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!fullName || !corporateEmail) {
    return badRequest('Nombre completo y correo corporativo son obligatorios.');
  }

  if (!EMAIL_RE.test(corporateEmail)) {
    return badRequest('El correo corporativo no tiene un formato válido.');
  }

  const domain = corporateEmail.toLowerCase().split('@')[1];
  if (domain && BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return badRequest('Por favor, utilice un correo corporativo válido.');
  }

  try {
    const doc = await sanityWriteClient.create({
      _type: 'lead',
      fullName,
      corporateEmail,
      jobTitle,
      infrastructure,
      message,
      source,
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true, id: doc._id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al guardar el lead en Sanity:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'No se pudo guardar la solicitud. Intente nuevamente.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
