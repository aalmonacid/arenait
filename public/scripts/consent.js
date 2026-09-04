/**
 * Estado de consentimiento de cookies, persistido en localStorage propio (no
 * cookie de terceros). Vive como archivo estático en /public (no procesado
 * por Astro/Vite) a propósito: la CSP del sitio (`vercel.json`, `script-src
 * 'self'`, sin `unsafe-inline`) bloquea cualquier <script> con contenido
 * inline en producción — Astro inlinea el JS de los componentes compartidos
 * (usados en BaseLayout, o sea en todas las páginas) directamente en el HTML
 * en el build de producción, así que un <script> normal dentro de un .astro
 * queda silenciosamente roto en producción aunque funcione en `astro dev`
 * (sin CSP) — ver CONTEXT.md §5. Un archivo real en /public, referenciado
 * con <script src="/scripts/...">, es una URL same-origin real y sí cumple
 * `script-src 'self'`.
 *
 * Cualquier script de analítica/reCAPTCHA futuro debe seguir el mismo
 * patrón (archivo real en /public/scripts/, no <script> inline en un
 * .astro) y consultar hasAcceptedTracking() antes de inyectarse:
 *
 *   import { hasAcceptedTracking } from '/scripts/consent.js';
 *   if (hasAcceptedTracking()) {
 *     // inyectar aquí el <script> de analítica/reCAPTCHA
 *   }
 */
export const CONSENT_STORAGE_KEY = 'arenait-cookie-consent';
export const CONSENT_VERSION = '1.0';

export function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.choice === 'accepted' || parsed?.choice === 'rejected') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeConsent(choice) {
  const record = {
    choice,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage inaccesible (modo privado estricto, cuotas): no persiste
    // entre visitas, pero no debe romper la UI del banner.
  }
  return record;
}

export function hasAcceptedTracking() {
  return readConsent()?.choice === 'accepted';
}
