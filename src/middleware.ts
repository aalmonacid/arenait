/**
 * Cabeceras de seguridad para las respuestas que genera el Worker.
 *
 * `public/_headers` solo se aplica a los archivos estáticos (páginas
 * prerenderizadas, fuentes, scripts). Lo que responde el Worker —`/api/*` y el
 * Studio en `/admin`— nunca pasaba por `_headers` y salía sin HSTS, sin
 * `X-Frame-Options` y sin CSP (auditoría 14/11/2026). Este middleware cubre ese
 * hueco.
 */
import { defineMiddleware } from 'astro:middleware';

const BASE_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
};

// El API solo devuelve JSON: no necesita cargar nada ni puede enmarcarse.
const API_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Robots-Tag': 'noindex, nofollow',
};

// Sanity Studio: React + styled-components (estilos en línea) y conexiones a
// los hosts de Sanity (API HTTP y WebSocket). Se publica en modo SOLO REPORTE:
// no bloquea nada, pero las violaciones aparecen en la consola del navegador
// y permiten ajustar la política con datos reales antes de hacerla efectiva
// (cambiar la cabecera a `Content-Security-Policy`). Ver PLAN-MEJORAS.md.
const STUDIO_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.sanity.io",
  "font-src 'self' data: https://*.sanity.io",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io",
  "frame-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
  "media-src 'self' blob: https://*.sanity.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const ADMIN_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy-Report-Only': STUDIO_CSP,
  'X-Robots-Tag': 'noindex, nofollow',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const { pathname } = context.url;

  const extra =
    pathname === '/api' || pathname.startsWith('/api/')
      ? API_HEADERS
      : pathname === '/admin' || pathname.startsWith('/admin/')
        ? ADMIN_HEADERS
        : {};

  // Las respuestas pueden traer cabeceras inmutables: se reconstruye la
  // respuesta con una copia de las cabeceras en lugar de modificarlas.
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries({ ...BASE_HEADERS, ...extra })) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
