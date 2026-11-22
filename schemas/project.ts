import { AUTHORIZATIONS, PROJECT_CATEGORIES, SECTORS } from './options';

/**
 * Proyecto entregado. Aparece en /proyectos y, si está marcado, en el inicio.
 *
 * Autorizar un caso = PUBLICARLO en el Studio (mientras esté en borrador, el
 * sitio no lo ve). El campo «Autorización» solo deja constancia de cómo se
 * puede nombrar al cliente; no controla la publicación.
 */
export const projectSchema = {
  name: 'project',
  title: 'Proyecto',
  type: 'document',
  fieldsets: [
    { name: 'service', title: 'Servicio relacionado', options: { columns: 2 } },
    { name: 'secondary', title: 'Segundo servicio (opcional)', options: { columns: 2 } },
    { name: 'home', title: 'Inicio', options: { columns: 1 } },
  ],
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Dirección (slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Posición en /proyectos dentro de su grupo (1 aparece primero).',
      validation: (Rule: any) => Rule.required().integer().min(1),
    },
    {
      name: 'authorization',
      title: 'Autorización',
      type: 'string',
      description:
        'Cómo se puede nombrar al cliente. Un caso «Pendiente» debe quedarse en borrador: publicarlo es lo que lo muestra en el sitio.',
      options: { list: AUTHORIZATIONS, layout: 'dropdown' },
      initialValue: 'pendiente',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'client',
      title: 'Cliente',
      type: 'string',
      description:
        'Solo el nombre real si hay autorización; si no, una descripción anónima («Entidad financiera»).',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'intermediary',
      title: 'A través de',
      type: 'string',
      description: 'Consultora o intermediario por el que se hizo el proyecto (opcional).',
    },
    {
      name: 'sector',
      title: 'Sector',
      type: 'string',
      options: { list: SECTORS, layout: 'dropdown' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Servicio (filtro y grupo)',
      type: 'string',
      options: { list: PROJECT_CATEGORIES, layout: 'dropdown' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'serviceLabel',
      title: 'Servicio: texto',
      type: 'string',
      fieldset: 'service',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'serviceAnchor',
      title: 'Servicio: ancla',
      type: 'string',
      description: 'Dirección del servicio en /servicios (por ejemplo, bizagi).',
      fieldset: 'service',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'secondaryServiceLabel',
      title: 'Segundo servicio: texto',
      type: 'string',
      fieldset: 'secondary',
    },
    {
      name: 'secondaryServiceAnchor',
      title: 'Segundo servicio: ancla',
      type: 'string',
      fieldset: 'secondary',
    },
    {
      name: 'technologies',
      title: 'Tecnologías',
      type: 'string',
      description: 'Solo si agregan información que el título y el servicio no dicen.',
    },
    {
      name: 'challenge',
      title: 'Reto',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'whatWeDid',
      title: 'Qué hicimos',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Una oración completa por elemento, con punto final.',
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: 'result',
      title: 'Resultado',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'note',
      title: 'Nota',
      type: 'string',
      description: 'Aclaración al pie de la tarjeta (por ejemplo, de quién es un producto).',
    },
    {
      name: 'featuredOnHome',
      title: 'Destacado en el inicio',
      type: 'boolean',
      fieldset: 'home',
      description: 'Se recomiendan 3 proyectos destacados.',
      initialValue: false,
    },
    {
      name: 'homeOrder',
      title: 'Orden en el inicio',
      type: 'number',
      fieldset: 'home',
      description: 'Posición entre los destacados (1 aparece primero).',
      validation: (Rule: any) => Rule.integer().min(1),
    },
    {
      name: 'homeSummary',
      title: 'Resumen para el inicio',
      type: 'text',
      rows: 2,
      fieldset: 'home',
    },
  ],
  orderings: [
    {
      title: 'Orden en el sitio',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', client: 'client', order: 'order', authorization: 'authorization' },
    prepare({
      title,
      client,
      order,
      authorization,
    }: {
      title?: string;
      client?: string;
      order?: number;
      authorization?: string;
    }) {
      const pending = authorization === 'pendiente' ? ' · pendiente' : '';
      return { title: `${order ?? '–'}. ${title ?? 'Sin título'}`, subtitle: `${client ?? ''}${pending}` };
    },
  },
};
