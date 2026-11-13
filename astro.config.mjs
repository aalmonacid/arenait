import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Dominio canónico: se define con PUBLIC_SITE_URL en las variables de compilación de Cloudflare cuando el cliente
  // decida entre arenait.co y www.arenait.co (hoy arenait.co redirige a www).
  site: process.env.PUBLIC_SITE_URL ?? 'https://arenait.co',
  // 'server' habilita las API routes (/api/leads), que corren como Worker de
  // Cloudflare. Las páginas de contenido se marcan `prerender = true`
  // individualmente y salen como archivos estáticos — ver CONTEXT.md §3.
  output: 'server',
  // URLs sin barra final (/contacto), igual que enlazan el menú y las redirecciones.
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: cloudflare({ imageService: 'passthrough' }),
  // Secretos que solo lee el servidor en tiempo de ejecución (Cloudflare los
  // entrega como variables del Worker, no como import.meta.env).
  env: {
    schema: {
      SANITY_API_WRITE_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_TO_OWNER: envField.string({ context: 'server', access: 'secret', optional: true }),
      LEAD_NOTIFY_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    tailwind(),
    sanity({
      projectId: 'xbayv7k2',
      dataset: 'production',
      useCdn: false, // Recomendado para obtener los datos más recientes en operaciones críticas
      apiVersion: '2024-01-01',
      studioUrl: '/admin',
    }),
    react(),
    sitemap({
      // Auditoría SEO 2026-09-04 (Épica K): /admin (Sanity Studio) está prerenderizado
      // (src/pages/admin/[...index].astro) y sin este filtro aparecía publicado en
      // sitemap-0.xml real de producción — confirmado en vivo. No es contenido
      // público, se excluye explícitamente.
      filter: (page) => !new URL(page).pathname.startsWith('/admin'),
    }),
  ],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom', 'sanity', 'styled-components'],
    },
    optimizeDeps: {
      include: ['sanity', '@sanity/astro'],
    },
  },
});
