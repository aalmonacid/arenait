import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Colección de artículos de blog (Épica L de BACKLOG.md). Usa la Content
// Layer API de Astro 5+ (loader-based, `src/content.config.ts` en la raíz
// de `src/`, no `src/content/config.ts` legacy) — confirmado como la
// ubicación que Astro busca primero en esta versión (7.2.0, ver
// node_modules/astro/dist/content/utils.js). El loader `glob` lee los
// archivos .md reales de `src/content/blog/`; hoy esa carpeta está vacía
// a propósito (el contenido lo escribe `content-strategist` en un
// siguiente paso) — las páginas de blog manejan ese caso con un estado
// vacío honesto, no fabrican artículos de relleno.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
