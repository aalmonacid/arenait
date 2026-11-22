import { isSafeHref } from '../src/lib/safeHref';

/**
 * Texto enriquecido del blog y de la política de datos (Portable Text), limitado
 * a lo que el sitio sabe mostrar: párrafo, títulos H2/H3, cita, listas con
 * viñetas o numeradas, negrita, cursiva, enlaces e imágenes. No hay HTML libre.
 * El conversor del sitio es src/lib/portableText.ts.
 */
const linkField = {
  name: 'href',
  title: 'Dirección',
  type: 'string',
  description:
    'Dirección completa (https://...), correo (mailto:nombre@dominio), ruta del sitio (/contacto) o ancla (#cookies).',
  validation: (Rule: any) =>
    Rule.required().custom((value: unknown) =>
      !value || isSafeHref(value)
        ? true
        : 'Usa una dirección que empiece por https://, http://, mailto:, / o #.',
    ),
};

const imageType = {
  type: 'image',
  title: 'Imagen',
  options: { hotspot: true },
  fields: [
    {
      name: 'alt',
      title: 'Texto alternativo',
      type: 'string',
      description:
        'Describe la imagen para quien no puede verla. Obligatorio: sin él, la imagen no se publica.',
      validation: (Rule: any) => Rule.required(),
    },
    { name: 'caption', title: 'Pie de foto (opcional)', type: 'string' },
  ],
};

export const richText = (name: string, title: string, extra: Record<string, unknown> = {}) => ({
  name,
  title,
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Párrafo', value: 'normal' },
        { title: 'Título (H2)', value: 'h2' },
        { title: 'Subtítulo (H3)', value: 'h3' },
        { title: 'Cita', value: 'blockquote' },
      ],
      lists: [
        { title: 'Viñetas', value: 'bullet' },
        { title: 'Numerada', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Negrita', value: 'strong' },
          { title: 'Cursiva', value: 'em' },
        ],
        annotations: [{ name: 'link', type: 'object', title: 'Enlace', fields: [linkField] }],
      },
    },
    imageType,
  ],
  ...extra,
});
