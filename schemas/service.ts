/**
 * Servicio de ArenaIT. El cliente puede crear, modificar y eliminar servicios
 * desde el Studio (/admin). Reglas que el sitio aplica con estos campos:
 * - `order`: posición en el inicio y en /servicios (menor número = primero).
 * - `featured`: ocupa 2 columnas en el inicio (se recomiendan 2 destacados
 *   entre 6 servicios para que la cuadrícula cierre sin huecos).
 * - `icon`: solo los íconos del set del tablero de marca (lista cerrada).
 */
export const SERVICE_ICONS = [
  { title: 'Monitor con engranajes (desarrollo)', value: 'code' },
  { title: 'Manos con engranaje (implementación)', value: 'deploy' },
  { title: 'Portapapeles con diana (gestión de proyectos)', value: 'tasks' },
  { title: 'Barras con flecha (inteligencia de negocio)', value: 'chart' },
  { title: 'Nodos con check (calidad)', value: 'shield-check' },
  { title: 'Engranaje con bombilla (mantenimiento)', value: 'wrench' },
  { title: 'Escalera hacia gráfico (evolución)', value: 'refresh' },
];

export const serviceSchema = {
  name: 'service',
  title: 'Servicio',
  type: 'document',
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
      description:
        'Se genera desde el título (botón «Generate»). Es la parte final de la URL: evita cambiarla una vez publicado.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Ícono',
      type: 'string',
      description: 'Ícono del set del tablero de marca.',
      options: {
        list: SERVICE_ICONS,
        layout: 'dropdown',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Posición en el sitio: 1 aparece primero, 2 segundo, y así sucesivamente.',
      validation: (Rule: any) => Rule.required().integer().min(1),
    },
    {
      name: 'featured',
      title: 'Destacado en el inicio',
      type: 'boolean',
      description:
        'Si está activo, la tarjeta ocupa el doble de ancho en el inicio. Se recomiendan 2 destacados en total.',
      initialValue: false,
    },
    {
      name: 'summary',
      title: 'Resumen',
      type: 'string',
      description: 'Una línea de descripción, usada en la tarjeta del inicio.',
      validation: (Rule: any) => Rule.required().max(200),
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text',
      description: 'Descripción completa, usada en la página de Servicios.',
      validation: (Rule: any) => Rule.required(),
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
    select: { title: 'title', subtitle: 'summary', order: 'order' },
    prepare({ title, subtitle, order }: { title?: string; subtitle?: string; order?: number }) {
      return { title: `${order ?? '–'}. ${title ?? 'Sin título'}`, subtitle };
    },
  },
};
