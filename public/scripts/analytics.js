/**
 * Vercel Web Analytics, gateado por el consentimiento de cookies
 * (`hasAcceptedTracking()` en /scripts/consent.js — ver BACKLOG.md Épica J).
 *
 * Por qué esto NO usa el componente `<Analytics />` de `@vercel/analytics/astro`:
 * se probó empíricamente (`npx astro build` con una página de prueba) y ese
 * componente compila a un `<script type="module">` con el JS del paquete
 * *inlineado directamente en el HTML* (node_modules/@vercel/analytics/dist/astro/index.astro
 * usa un bloque <script> de Astro, no `is:inline` con src). Usado en un
 * componente compartido (BaseLayout), Astro lo inserta como texto en cada
 * página — exactamente el patrón de CONTEXT.md §5 bug #8 que causó 11 días
 * de caída en producción: la CSP del sitio (`script-src 'self'`, sin
 * `unsafe-inline`, ver vercel.json) bloquea ese script en silencio en
 * producción real, aunque funcione en `astro dev` (sin CSP).
 *
 * Por qué esto tampoco hace `import { inject } from '@vercel/analytics'`:
 * `public/` se sirve tal cual, sin pasar por Vite/Rollup, así que un
 * specifier de paquete de npm (`@vercel/analytics`) no resuelve en el
 * navegador (no hay import map). Este archivo replica a mano la lógica
 * mínima de dist/index.mjs de esa librería (`inject`/`track`/`pageview`):
 * misma cola `window.va`/`window.vaq`, mismo script de destino
 * (`/_vercel/insights/script.js`, ruta same-origin que Vercel proxea — no
 * requiere agregar ningún dominio nuevo a script-src/connect-src en
 * vercel.json). El paquete `@vercel/analytics` sigue instalado como
 * dependencia (para uso futuro server-side vía `@vercel/analytics/server`
 * si se decide trackear eventos desde /api/leads.ts), pero el bundle que
 * corre en el navegador es este archivo, no el paquete.
 *
 * Gateo de consentimiento:
 * - Si ya había consentimiento aceptado de una visita anterior
 *   (localStorage, ver consent.js), arranca de inmediato en este load.
 * - Si el usuario acepta el banner durante ESTA MISMA carga de página,
 *   arranca sin esperar un reload: cookie-consent.js dispara el evento
 *   'arenait:consent-changed' con { detail: { choice } } al decidir, y este
 *   script escucha ese evento y arranca si choice === 'accepted'.
 * - Si el usuario rechaza (o no ha decidido), nunca se agrega el <script>
 *   de Vercel al DOM: cero requests de tracking salen del navegador.
 */
import { hasAcceptedTracking } from '/scripts/consent.js';

const SCRIPT_SRC = '/_vercel/insights/script.js';

let started = false;

function initQueue() {
  if (window.va) return;
  window.va = function va(...params) {
    (window.vaq = window.vaq || []).push(params);
  };
}

function injectScript() {
  if (document.head.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  script.defer = true;
  script.dataset.sdkn = '@vercel/analytics/arenait-manual';
  script.onerror = () => {
    // Falla silenciosa esperable si "Web Analytics" no está habilitado para
    // este proyecto en el dashboard de Vercel (paso de configuración, no de
    // código) — ver https://vercel.com/docs/analytics/quickstart.
    console.warn(
      `[ArenaIT analytics] No se pudo cargar ${SCRIPT_SRC}. Verifica que Web Analytics esté habilitado en el proyecto de Vercel.`,
    );
  };
  document.head.appendChild(script);
}

/** Arranca el tracking (idempotente). Solo debe llamarse tras confirmar consentimiento. */
export function startAnalytics() {
  if (started) return;
  started = true;
  initQueue();
  injectScript();
}

/**
 * Trackea un evento custom (ver documentación de @vercel/analytics sobre
 * custom events). No-op si no hay consentimiento o si el tracking no ha
 * arrancado, para que ningún caller necesite volver a chequear consentimiento.
 */
export function trackEvent(name, properties) {
  if (!started || !hasAcceptedTracking() || typeof window.va !== 'function') return;
  window.va('event', properties ? { name, data: properties } : { name });
}

if (hasAcceptedTracking()) {
  startAnalytics();
}

window.addEventListener('arenait:consent-changed', (event) => {
  if (event.detail?.choice === 'accepted') {
    startAnalytics();
  }
});

// Evento de conversión de bajo riesgo (BACKLOG.md Épica J / .claude/agents/
// cro-analytics-engineer.md "Conversion events to define"): clic en el botón
// flotante de WhatsApp (id="whatsapp-float" en WhatsAppButton.astro). No
// depende del componente, así que sigue funcionando aunque cambie su markup
// interno. trackEvent() ya es no-op sin consentimiento, así que no hace falta
// duplicar el chequeo aquí.
document.getElementById('whatsapp-float')?.addEventListener('click', () => {
  trackEvent('WhatsApp Click');
});

// Expuesto en window para que otros scripts estáticos no-módulo (p.ej.
// lead-form.js, cargado como <script> clásico, no type="module", por ser el
// flujo más sensible del sitio — ver CONTEXT.md §5) puedan trackear eventos
// sin depender de import/export de ES modules. Seguro de llamar en cualquier
// momento: trackEvent ya es no-op sin consentimiento/antes de arrancar.
window.arenaitAnalytics = { trackEvent };
