import { createClient } from '@sanity/client';

/**
 * Cliente de Sanity con permisos de escritura. Solo debe importarse desde
 * código server-side (API routes) — requiere SANITY_API_WRITE_TOKEN, que
 * nunca debe exponerse al cliente.
 */
export const sanityWriteClient = createClient({
  projectId: 'xbayv7k2',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: import.meta.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
