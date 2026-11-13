import { createClient } from '@sanity/client';
import { SANITY_API_WRITE_TOKEN } from 'astro:env/server';

/**
 * Cliente de Sanity con permisos de escritura. Solo debe usarse desde código
 * server-side (API routes): requiere SANITY_API_WRITE_TOKEN, que nunca debe
 * exponerse al cliente. Se crea al usarlo (no al cargar el módulo) porque en
 * Cloudflare los secretos solo están disponibles durante una petición.
 */
export function getSanityWriteClient() {
  return createClient({
    projectId: 'xbayv7k2',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });
}
