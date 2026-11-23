import type { Rule as SanityRule } from 'sanity';
import { PILLARS } from './options';

/**
 * Servicio de Arena IT. El cliente puede crear, modificar y eliminar servicios
 * desde el Studio (/admin). Reglas que el sitio aplica con estos campos:
 * - `pillar`: pilar de /servicios en el que aparece el servicio.
 * - `order`: posición dentro de /servicios (menor número = primero).
 * - `slug`: ancla del servicio en /servicios y valor de `/contacto?servicio=`
 *   (debe coincidir con las opciones del formulario de contacto).
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
      validation: (Rule: SanityRule) => Rule.required(),
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
      validation: (Rule: SanityRule) => Rule.required(),
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
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Posición en /servicios: 1 aparece primero, 2 segundo, y así sucesivamente.',
      validation: (Rule: SanityRule) => Rule.required().integer().min(1),
    },
    {
      name: 'pillar',
      title: 'Pilar',
      type: 'string',
      options: { list: PILLARS, layout: 'dropdown' },
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'featured',
      title: 'Destacado',
      type: 'boolean',
      description: 'Sin efecto por ahora: el inicio muestra los tres pilares, no servicios sueltos.',
      initialValue: false,
    },
    {
      name: 'summary',
      title: 'Resumen',
      type: 'string',
      description:
        'Una línea (primera oración de «Qué hacemos»). Se usa en los datos para buscadores.',
      validation: (Rule: SanityRule) => Rule.required().max(200),
    },
    {
      name: 'seoHeading',
      title: 'Subtítulo para buscadores',
      type: 'string',
      description:
        'Opcional. Título alternativo con las palabras que busca la gente (por ejemplo, «Implementación y desarrollo en Bizagi»).',
    },
    {
      name: 'whenNeeded',
      title: 'Cuando lo necesitas',
      type: 'text',
      rows: 3,
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'whatWeDo',
      title: 'Qué hacemos',
      type: 'text',
      rows: 4,
      description: 'Un enlace interno se escribe [texto](#ancla) o [texto](/ruta).',
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'deliverables',
      title: 'Qué recibes',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Una frase corta por elemento, sin punto final.',
      validation: (Rule: SanityRule) => Rule.required().min(1),
    },
    {
      name: 'aiTitle',
      title: 'IA en este servicio: encabezado',
      type: 'string',
      description: 'Opcional (por ejemplo, «IA en tus procesos Bizagi»).',
    },
    {
      name: 'aiCapabilities',
      title: 'IA en este servicio: capacidades',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Opcional (se usa en Bizagi).',
    },
    {
      name: 'aiNote',
      title: 'IA en este servicio: nota',
      type: 'text',
      rows: 3,
      description: 'Opcional. Se muestra bajo las capacidades de IA.',
    },
    {
      name: 'experience',
      title: 'Experiencia',
      type: 'text',
      rows: 3,
      description: 'Opcional. Puede llevar un enlace interno: [Ver proyectos →](/proyectos?servicio=bizagi).',
    },
    {
      name: 'typicalCases',
      title: 'Casos típicos',
      type: 'text',
      rows: 3,
      description: 'Opcional.',
    },
    {
      name: 'description',
      title: 'Descripción (obsoleto)',
      type: 'text',
      description:
        'Obsoleto: lo reemplazan «Cuando lo necesitas» y «Qué hacemos». Ya no se muestra en el sitio.',
      readOnly: true,
      hidden: ({ value }: { value?: string }) => !value,
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
