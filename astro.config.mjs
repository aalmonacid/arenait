import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://arenait.co',
  // 'server' habilita las API routes (/api/leads) como funciones serverless
  // reales en Vercel. Las páginas de contenido se marcan `prerender = true`
  // individualmente para seguir siendo estáticas — ver CONTEXT.md §3.
  output: 'server',
  adapter: vercel(),
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
