/**
 * Validación y saneamiento puros del payload de /api/leads. Vive aparte del
 * endpoint para poder probarse con Vitest sin levantar Astro ni Sanity.
 *
 * Reglas (endurecimiento previo a producción, 12/11/2026):
 * - Todos los campos tienen un tope de longitud: sin esto cualquier cliente
 *   podía guardar mensajes de megabytes en el dataset de Sanity.
 * - Se eliminan caracteres de control, C1, separadores Unicode de línea y marcas
 *   bidireccionales. Solo el mensaje conserva saltos de línea y tabulaciones:
 *   el resto de campos se colapsa a una sola línea.
 * - `source` ya no es libre: solo se aceptan orígenes conocidos.
 */

export const LIMITS = {
  fullName: 120,
  company: 160,
  corporateEmail: 254, // máximo práctico de una dirección de correo (RFC 5321)
  phone: 40,
  serviceOfInterest: 120,
  message: 4000,
  policyVersion: 40,
} as const;

/** Longitud máxima aceptada del token del captcha (los reales miden < 2100). */
const MAX_CAPTCHA_TOKEN = 2048;

/** Tamaño máximo del cuerpo JSON de la solicitud, en bytes. */
export const MAX_BODY_BYTES = 16 * 1024;

const ALLOWED_SOURCES = new Set(['lead-capture-form']);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Lead {
  fullName: string;
  company: string;
  corporateEmail: string;
  phone: string;
  serviceOfInterest: string;
  message: string;
  source: string;
  policyAccepted: true;
  policyVersion: string;
}

export type LeadValidation =
  | { kind: 'honeypot' }
  | { kind: 'invalid'; error: string }
  | {
      kind: 'ok';
      lead: Lead;
      /** El visitante pidió recibir una copia de su mensaje en su correo. */
      sendCopy: boolean;
      /** Token del captcha (Cloudflare Turnstile), vacío si no hay captcha. */
      captchaToken: string;
    };

// Caracteres de control C0 salvo \t (9), \n (10) y \r (13), DEL (127), C1
// (128-159), separadores de línea/párrafo Unicode (U+2028/2029) y marcas de
// dirección bidireccional (permiten disfrazar texto en correos y paneles).
/* eslint-disable no-control-regex */
const CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u2028\u2029\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
/* eslint-enable no-control-regex */

/** Texto libre multilínea (solo el mensaje): conserva saltos de línea y tabulaciones. */
function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(CONTROL_CHARS, '').trim() : '';
}

/**
 * Campo de una sola línea (nombre, empresa, teléfono...): colapsa cualquier
 * salto o espacio repetido. Evita que un valor falsifique líneas completas
 * ("Correo: ...") en los correos y avisos que se arman con estos campos.
 */
function cleanLine(value: unknown): string {
  return clean(value).replace(/\s+/g, ' ');
}

const FIELD_LABELS: Record<keyof typeof LIMITS, string> = {
  fullName: 'El nombre',
  company: 'La empresa',
  corporateEmail: 'El correo',
  phone: 'El teléfono',
  serviceOfInterest: 'El servicio de interés',
  message: 'El mensaje',
  policyVersion: 'La versión de la política',
};

export function validateLead(body: unknown): LeadValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { kind: 'invalid', error: 'El cuerpo de la solicitud debe ser un objeto JSON.' };
  }

  const raw = body as Record<string, unknown>;

  // Honeypot: un bot lo completa, un humano nunca. Se evalúa primero para no
  // darle información sobre qué otras validaciones habría fallado.
  if (clean(raw.companyWebsite)) {
    return { kind: 'honeypot' };
  }

  const fields = {
    fullName: cleanLine(raw.fullName),
    company: cleanLine(raw.company),
    corporateEmail: cleanLine(raw.corporateEmail),
    phone: cleanLine(raw.phone),
    serviceOfInterest: cleanLine(raw.serviceOfInterest),
    message: clean(raw.message),
    policyVersion: cleanLine(raw.policyVersion),
  };

  for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    if (fields[key].length > LIMITS[key]) {
      return {
        kind: 'invalid',
        error: `${FIELD_LABELS[key]} supera el máximo de ${LIMITS[key]} caracteres.`,
      };
    }
  }

  if (!fields.fullName || !fields.corporateEmail) {
    return { kind: 'invalid', error: 'Nombre completo y correo son obligatorios.' };
  }

  if (!EMAIL_RE.test(fields.corporateEmail)) {
    return { kind: 'invalid', error: 'El correo no tiene un formato válido.' };
  }

  if (raw.policyAccepted !== true) {
    return {
      kind: 'invalid',
      error: 'Debes aceptar la Política de Tratamiento de Datos Personales.',
    };
  }

  const requestedSource = cleanLine(raw.source) || 'lead-capture-form';
  const source = ALLOWED_SOURCES.has(requestedSource) ? requestedSource : 'lead-capture-form';

  return {
    kind: 'ok',
    lead: { ...fields, source, policyAccepted: true },
    sendCopy: raw.sendCopy === true,
    captchaToken: clean(raw.turnstileToken).slice(0, MAX_CAPTCHA_TOKEN),
  };
}

/**
 * Defensa CSRF/abuso desde otros sitios. Un POST hecho con `fetch` desde el
 * navegador siempre lleva `Origin`, que debe coincidir con el origen de la
 * propia solicitud. Si falta `Origin`, solo se acepta cuando el navegador
 * declara `Sec-Fetch-Site: same-origin` (cabecera que los scripts ajenos no
 * pueden falsificar desde un navegador). Curl y herramientas de servidor sin
 * ninguna de las dos cabeceras se rechazan. Esto no sustituye al captcha, al
 * rate limiting ni al honeypot.
 */
export function isAllowedOrigin(
  requestUrl: string,
  originHeader: string | null,
  secFetchSite: string | null = null,
): boolean {
  if (!originHeader) return secFetchSite === 'same-origin';
  try {
    return new URL(originHeader).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

/**
 * Lee el cuerpo como texto cortando en cuanto supera `maxBytes` (no depende de
 * `Content-Length`, que puede faltar o mentir). Devuelve `null` si se excede.
 */
export async function readBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

/** El endpoint solo recibe JSON: cualquier otro tipo de contenido se rechaza. */
export function isJsonContentType(contentType: string | null): boolean {
  return /^application\/json(\s*;|$)/i.test(contentType ?? '');
}

/**
 * ID del documento de lead. El punto en el `_id` convierte el documento en
 * "privado" para el API público de datasets públicos de Sanity (los IDs con
 * ruta, por ejemplo `lead.<uuid>`, no se sirven sin token). Es una barrera
 * adicional, no la única: el dataset debería ser privado o los leads vivir en
 * un dataset aparte — ver PLAN-PRODUCCION.md.
 */
export function leadDocumentId(uuid: string = crypto.randomUUID()): string {
  return `lead.${uuid}`;
}
