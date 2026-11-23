import type { Rule as SanityRule, ValidationContext } from 'sanity';
import { richText } from './portableText';

/**
 * Artículo del blog. Se publica en /blog/<slug> cuando se publica en el Studio
 * (el webhook reconstruye el sitio en unos minutos). Regla "todo o nada": en
 * cuanto hay al menos un artículo completo en Sanity, el blog muestra solo los
 * de Sanity (ver src/lib/contentRules.ts).
 */
const todayIso = () => new Date().toISOString().slice(0, 10);

export const postSchema = {
  name: 'post',
  title: 'Artículo',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Dirección (slug)',
      type: 'slug',
      description:
        'Se genera desde el título (botón «Generate»). Es la parte final de la URL (/blog/...): no la cambies una vez publicado.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: SanityRule) =>
        Rule.required().custom((value: { current?: string } | undefined) =>
          !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
            ? true
            : 'Solo minúsculas, números y guiones (sin tildes ni espacios).',
        ),
    },
    {
      name: 'description',
      title: 'Resumen',
      type: 'text',
      rows: 3,
      description:
        'Aparece en el listado del blog y como descripción para buscadores (entre 120 y 160 caracteres es lo ideal).',
      validation: (Rule: SanityRule) => Rule.required().max(300),
    },
    {
      name: 'publishDate',
      title: 'Fecha de publicación',
      type: 'date',
      initialValue: todayIso,
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'author',
      title: 'Autor',
      type: 'string',
      initialValue: 'Equipo Arena IT',
    },
    {
      name: 'tags',
      title: 'Etiquetas',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Aparecen sobre el título del artículo.',
    },
    {
      name: 'coverImage',
      title: 'Imagen de portada (opcional)',
      type: 'image',
      options: { hotspot: true },
      description: 'Se muestra al inicio del artículo y como imagen al compartirlo en redes.',
      fields: [
        {
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Obligatorio si hay imagen: sin él, la portada no se publica.',
          validation: (Rule: SanityRule) =>
            Rule.custom((value: string | undefined, context: ValidationContext) =>
              context.parent?.asset && !value?.trim()
                ? 'Describe la imagen (texto alternativo).'
                : true,
            ),
        },
      ],
    },
    richText('body', 'Cuerpo del artículo', {
      description:
        'Párrafos, títulos H2/H3, citas, listas, negrita, cursiva, enlaces e imágenes (con texto alternativo).',
      validation: (Rule: SanityRule) => Rule.required().min(1),
    }),
  ],
  orderings: [
    {
      title: 'Fecha de publicación (más reciente primero)',
      name: 'publishDateDesc',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishDate', media: 'coverImage' },
  },
};
