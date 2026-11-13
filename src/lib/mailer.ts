/**
 * Envío de correos transaccionales con Resend (https://resend.com), sin
 * dependencias nuevas: una llamada `fetch` a su API.
 *
 * Variables de entorno (todas server-only, se cargan en Vercel):
 * - RESEND_API_KEY   clave de la API de Resend.
 * - MAIL_FROM        remitente, por ejemplo `ArenaIT <contacto@arenait.co>`. El
 *                    dominio debe estar verificado en Resend (registros DNS).
 * - MAIL_TO_OWNER    buzón que recibe cada contacto nuevo (opcional).
 *
 * Sin RESEND_API_KEY o MAIL_FROM no se envía nada y el formulario sigue
 * funcionando. Los correos son siempre texto plano (sin HTML): lo que escribe el
 * visitante nunca se interpreta como marcado.
 */
import type { Lead } from './leadValidation';

export interface MailConfig {
  apiKey?: string;
  from?: string;
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

/** Una sola línea, sin saltos: evita inyectar encabezados por el asunto. */
export function oneLine(value: string, max = 120): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function isMailConfigured(config: MailConfig): boolean {
  return Boolean(config.apiKey && config.from);
}

export async function sendEmail(
  config: MailConfig,
  email: OutgoingEmail,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!isMailConfigured(config)) return false;

  try {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error('Resend respondió con error:', response.status);
    }
    return response.ok;
  } catch (error) {
    console.error('No se pudo enviar el correo:', error);
    return false;
  }
}

/** Aviso al dueño del sitio con el detalle completo del contacto. */
export function buildOwnerEmail(lead: Lead, to: string, studioUrl: string): OutgoingEmail {
  const who = lead.company || lead.fullName;
  return {
    to,
    subject: oneLine(`Nuevo contacto en ArenaIT: ${who}`),
    replyTo: lead.corporateEmail,
    text: [
      'Recibiste un nuevo contacto desde el formulario de arenait.co.',
      '',
      `Nombre: ${lead.fullName}`,
      `Empresa: ${lead.company || '—'}`,
      `Correo: ${lead.corporateEmail}`,
      `Teléfono: ${lead.phone || '—'}`,
      `Servicio de interés: ${lead.serviceOfInterest || '—'}`,
      '',
      'Mensaje:',
      lead.message || '—',
      '',
      `Detalle en el panel: ${studioUrl}`,
      '',
      'Puedes responder directamente a este correo: la respuesta llega al visitante.',
    ].join('\n'),
  };
}

/** Copia del mensaje para el visitante que la solicitó. */
export function buildCopyEmail(lead: Lead): OutgoingEmail {
  return {
    to: lead.corporateEmail,
    subject: 'Copia de tu mensaje a ArenaIT',
    text: [
      `Hola ${lead.fullName},`,
      '',
      'Recibimos tu mensaje y te escribiremos pronto con una propuesta concreta.',
      'Esta es la copia de lo que nos enviaste:',
      '',
      `Empresa: ${lead.company || '—'}`,
      `Teléfono: ${lead.phone || '—'}`,
      `Servicio de interés: ${lead.serviceOfInterest || '—'}`,
      '',
      'Mensaje:',
      lead.message || '—',
      '',
      '—',
      'ArenaIT · Desarrollo de software a la medida',
      '',
      'Recibes este correo porque alguien indicó esta dirección en el formulario de contacto de ArenaIT. Si no fuiste tú, puedes ignorarlo.',
    ].join('\n'),
  };
}
