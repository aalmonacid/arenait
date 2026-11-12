import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanityWriteClient';
import { checkRateLimit } from '../../lib/rateLimit';
import {
  MAX_BODY_BYTES,
  isAllowedOrigin,
  leadDocumentId,
  validateLead,
} from '../../lib/leadValidation';
import { notifyNewLead } from '../../lib/leadNotify';

export const prerender = false;

function json(status: number, payload: Record<string, unknown>, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Solo se aceptan envíos desde este mismo sitio cuando el navegador informa
  // su origen (evita formularios ajenos apuntando a este endpoint).
  if (!isAllowedOrigin(request.url, request.headers.get('origin'))) {
    return json(403, { ok: false, error: 'Origen no permitido.' });
  }

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
    return json(
      429,
      {
        ok: false,
        error: 'Demasiadas solicitudes desde este origen. Intenta de nuevo en unos minutos.',
      },
      { 'Retry-After': String(retryAfterSeconds) },
    );
  }

  // Tope de tamaño del cuerpo: primero por la cabecera (barato) y luego por el
  // texto realmente leído, porque Content-Length puede faltar o mentir.
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'La solicitud es demasiado grande.' });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json(400, { ok: false, error: 'No se pudo leer la solicitud.' });
  }

  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'La solicitud es demasiado grande.' });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json(400, { ok: false, error: 'El cuerpo de la solicitud debe ser JSON válido.' });
  }

  const result = validateLead(body);

  if (result.kind === 'honeypot') {
    // Bot: fingir éxito sin persistir nada ni revelar que fue detectado.
    return json(201, { ok: true });
  }

  if (result.kind === 'invalid') {
    return json(400, { ok: false, error: result.error });
  }

  const { lead } = result;

  try {
    const now = new Date().toISOString();
    // `_id` con prefijo `lead.`: documento privado para el API público de
    // Sanity (ver leadDocumentId en src/lib/leadValidation.ts).
    await sanityWriteClient.create({
      _id: leadDocumentId(),
      _type: 'lead',
      ...lead,
      createdAt: now,
      policyAcceptedAt: now,
    });
  } catch (error) {
    console.error('Error al guardar el lead en Sanity:', error);
    return json(502, {
      ok: false,
      error: 'No se pudo guardar la solicitud. Intente nuevamente.',
    });
  }

  // Aviso opcional (no bloquea ni cambia la respuesta si falla). No incluye
  // datos personales: ver src/lib/leadNotify.ts.
  const studioUrl = new URL('/admin', request.url).toString();
  await notifyNewLead(import.meta.env.LEAD_NOTIFY_WEBHOOK_URL, lead, studioUrl);

  // No se devuelve el ID interno del documento: el cliente no lo necesita.
  return json(201, { ok: true });
};
