import type { APIRoute } from 'astro';

export const prerender = true;

/**
 * robots.txt generado en build según PUBLIC_ALLOW_INDEXING (misma variable que
 * controla la etiqueta noindex en BaseLayout.astro):
 * - sin la variable (dev.arenait.co, previews): se bloquea todo el sitio.
 * - con PUBLIC_ALLOW_INDEXING=true (producción): se permite el rastreo, salvo
 *   /api/ y /admin/, y se publica el sitemap con el dominio canónico.
 */
export const GET: APIRoute = ({ site }) => {
  const allowIndexing = import.meta.env.PUBLIC_ALLOW_INDEXING === 'true';

  const body = allowIndexing
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /admin/',
        '',
        `Sitemap: ${new URL('sitemap-index.xml', site).toString()}`,
        '',
      ].join('\n')
    : ['User-agent: *', 'Disallow: /', ''].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
