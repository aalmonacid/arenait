/**
 * Aviso opcional de lead nuevo a un webhook entrante (Slack, Teams, Make,
 * Zapier, etc.). Se activa solo si existe la variable de entorno
 * `LEAD_NOTIFY_WEBHOOK_URL` en Vercel; sin ella no hace nada.
 *
 * Privacidad: el mensaje NO incluye correo, teléfono ni el texto del mensaje
 * del lead — solo empresa, servicio de interés y un enlace al Studio donde
 * quien tenga acceso puede ver el detalle. Así no se envían datos personales
 * a un tercero que no esté declarado en la Política de Tratamiento de Datos.
 *
 * Es "best effort": nunca debe hacer fallar ni demorar la respuesta al
 * visitante, así que usa un timeout corto y traga cualquier error.
 */
import type { Lead } from './leadValidation';

export function buildNotificationText(lead: Lead, studioUrl: string): string {
  const company = lead.company || 'sin empresa indicada';
  const service = lead.serviceOfInterest || 'sin servicio indicado';
  return `Nuevo lead en ArenaIT: ${company} — ${service}. Detalle en ${studioUrl}`;
}

export async function notifyNewLead(
  webhookUrl: string | undefined,
  lead: Lead,
  studioUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!webhookUrl) return false;

  try {
    const response = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: buildNotificationText(lead, studioUrl) }),
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (error) {
    console.error('No se pudo enviar el aviso de lead nuevo:', error);
    return false;
  }
}
