/**
 * Constructores de campos para los documentos de página (singletons). Se usan
 * objetos y arreglos simples (sin Portable Text): el texto se edita tal cual se
 * publica. Los enlaces dentro de un texto se escriben como [texto](/ruta) o
 * [texto](#ancla); solo se aceptan rutas internas.
 */
const required = (Rule: any) => Rule.required();

type Extra = Record<string, unknown>;

export const stringField = (name: string, title: string, extra: Extra = {}) => ({
  name,
  title,
  type: 'string',
  validation: required,
  ...extra,
});

export const textField = (name: string, title: string, extra: Extra = {}, rows = 3) => ({
  name,
  title,
  type: 'text',
  rows,
  validation: required,
  ...extra,
});

export const stringList = (name: string, title: string, extra: Extra = {}) => ({
  name,
  title,
  type: 'array',
  of: [{ type: 'string' }],
  validation: required,
  ...extra,
});

/** Texto + enlace (botones y accesos rápidos). */
export const linkObject = {
  type: 'object',
  fields: [
    { name: 'label', title: 'Texto', type: 'string', validation: required },
    {
      name: 'href',
      title: 'Enlace',
      type: 'string',
      description: 'Ruta interna (/servicios), ancla (#como-trabajamos) o dirección completa.',
      validation: required,
    },
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
};

export const linkField = (name: string, title: string, extra: Extra = {}) => ({
  name,
  title,
  ...linkObject,
  validation: required,
  ...extra,
});

export const linkListField = (name: string, title: string, extra: Extra = {}) => ({
  name,
  title,
  type: 'array',
  of: [linkObject],
  validation: required,
  ...extra,
});

/** Título + texto (tarjetas, principios, modelos de trabajo). */
export const titleTextObject = (titleLabel = 'Título', textLabel = 'Texto') => ({
  type: 'object',
  fields: [
    { name: 'title', title: titleLabel, type: 'string', validation: required },
    { name: 'text', title: textLabel, type: 'text', rows: 3, validation: required },
  ],
  preview: { select: { title: 'title', subtitle: 'text' } },
});

export const titleTextList = (
  name: string,
  title: string,
  extra: Extra = {},
  labels: { title?: string; text?: string } = {},
) => ({
  name,
  title,
  type: 'array',
  of: [titleTextObject(labels.title, labels.text)],
  validation: required,
  ...extra,
});

/** Título y descripción para buscadores (una pareja por página). */
export const seoFields = [
  stringField('seoTitle', 'Título para buscadores', {
    description: 'Sin el nombre de la marca: el sitio agrega " | Arena IT".',
  }),
  textField('seoDescription', 'Descripción para buscadores', {
    description: 'Entre 120 y 160 caracteres.',
  }),
];

/** Cierre de página: titular, texto, botones y (opcional) botón de WhatsApp. */
export const closingFields = (opts: { whatsapp?: boolean } = {}) => [
  stringField('closingTitle', 'Cierre: titular'),
  textField('closingText', 'Cierre: texto', { validation: undefined }, 2),
  linkListField('closingLinks', 'Cierre: botones', {
    description: 'El primero es el botón principal.',
    validation: (Rule: any) => Rule.required().min(1),
  }),
  ...(opts.whatsapp
    ? [
        {
          name: 'closingWhatsappLabel',
          title: 'Cierre: texto del botón de WhatsApp',
          type: 'string',
          description: 'Déjalo vacío para no mostrar el botón.',
        },
      ]
    : []),
];

/** Asigna un grupo (pestaña del Studio) a una lista de campos. */
export const inGroup = (group: string, fields: Extra[]) => fields.map((f) => ({ ...f, group }));
