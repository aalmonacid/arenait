import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://arenait.co',
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
    sitemap(),
  ],
});
