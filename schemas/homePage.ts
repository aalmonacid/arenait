import { PILLARS } from './options';
import {
  closingFields,
  inGroup,
  linkField,
  linkListField,
  seoFields,
  stringField,
  textField,
  titleTextList,
} from './helpers';

/** Página de inicio (documento único). */
export const homePageSchema = {
  name: 'homePage',
  title: 'Inicio',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Portada', default: true },
    { name: 'services', title: 'Servicios' },
    { name: 'process', title: 'Cómo trabajamos' },
    { name: 'projects', title: 'Proyectos y sectores' },
    { name: 'closing', title: 'Cierre' },
    { name: 'seo', title: 'Buscadores' },
  ],
  fields: [
    ...inGroup('seo', seoFields),
    ...inGroup('hero', [
      stringField('heroEyebrow', 'Portada: etiqueta'),
      stringField('heroTitle', 'Portada: titular'),
      {
        name: 'heroTitleHighlight',
        title: 'Portada: palabra subrayada',
        type: 'string',
        description: 'Opcional. Debe ser el final exacto del titular (por ejemplo «reales.»).',
      },
      textField('heroIntro', 'Portada: texto'),
      linkField('heroPrimaryCta', 'Portada: botón principal'),
      linkField('heroSecondaryCta', 'Portada: botón secundario'),
      linkListField('quickLinks', 'Accesos rápidos'),
    ]),
    ...inGroup('services', [
      stringField('servicesTitle', 'Servicios: titular'),
      {
        name: 'pillars',
        title: 'Servicios: los tres pilares',
        type: 'array',
        validation: (Rule: any) => Rule.required().length(3),
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'key',
                title: 'Pilar',
                type: 'string',
                options: { list: PILLARS, layout: 'dropdown' },
                validation: (Rule: any) => Rule.required(),
              },
              stringField('number', 'Número (01, 02, 03)'),
              stringField('title', 'Nombre'),
              textField('text', 'Texto'),
            ],
            preview: { select: { title: 'title', subtitle: 'text' } },
          },
        ],
      },
      stringField('pillarLinkLabel', 'Servicios: texto del enlace de cada pilar'),
      linkField('allServicesLink', 'Servicios: enlace a todos los servicios'),
    ]),
    ...inGroup('process', [
      stringField('processTitle', 'Cómo trabajamos: titular'),
      titleTextList('processSteps', 'Cómo trabajamos: las seis fases', {
        validation: (Rule: any) => Rule.required().length(6),
      }, { title: 'Fase' }),
      linkField('processLink', 'Cómo trabajamos: enlace'),
    ]),
    ...inGroup('projects', [
      stringField('projectsTitle', 'Proyectos: titular'),
      linkField('projectsLink', 'Proyectos: enlace a todos los proyectos'),
      stringField('sectorsTitle', 'Sectores: titular'),
    ]),
    ...inGroup('closing', closingFields({ whatsapp: true })),
  ],
  preview: { prepare: () => ({ title: 'Inicio' }) },
};
