import type { Rule as SanityRule } from 'sanity';
import { PILLARS } from './options';
import {
  closingFields,
  inGroup,
  linkField,
  linkListField,
  seoFields,
  stringField,
  stringList,
  textField,
  titleTextList,
} from './helpers';

/**
 * Página de Servicios (documento único). Los servicios en sí (los 13 bloques)
 * son documentos aparte, de tipo «Servicio».
 */
export const servicesPageSchema = {
  name: 'servicesPage',
  title: 'Servicios (página)',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Portada', default: true },
    { name: 'pillars', title: 'Pilares' },
    { name: 'sectors', title: 'Dónde hemos trabajado' },
    { name: 'process', title: 'Cómo trabajamos' },
    { name: 'models', title: 'Modelos de trabajo' },
    { name: 'security', title: 'Seguridad' },
    { name: 'faq', title: 'Preguntas frecuentes' },
    { name: 'closing', title: 'Cierre' },
    { name: 'seo', title: 'Buscadores' },
  ],
  fields: [
    ...inGroup('seo', seoFields),
    ...inGroup('hero', [
      stringField('heroEyebrow', 'Portada: etiqueta'),
      stringField('heroTitle', 'Portada: titular'),
      textField('heroIntro', 'Portada: texto'),
      linkField('heroPrimaryCta', 'Portada: botón principal'),
      linkField('heroSecondaryCta', 'Portada: botón secundario'),
      linkListField('quickLinks', 'Accesos rápidos'),
    ]),
    ...inGroup('pillars', [
      {
        name: 'pillars',
        title: 'Introducción de cada pilar',
        type: 'array',
        validation: (Rule: SanityRule) => Rule.required().length(3),
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'key',
                title: 'Pilar',
                type: 'string',
                options: { list: PILLARS, layout: 'dropdown' },
                validation: (Rule: SanityRule) => Rule.required(),
              },
              stringField('number', 'Número (01, 02, 03)'),
              stringField('title', 'Nombre'),
              stringField('heading', 'Titular'),
              textField('intro', 'Introducción'),
            ],
            preview: { select: { title: 'title', subtitle: 'heading' } },
          },
        ],
      },
      stringField('serviceCtaLabel', 'Texto del botón de cada servicio'),
    ]),
    ...inGroup('sectors', [
      stringField('sectorsTitle', 'Dónde hemos trabajado: titular'),
      linkField('sectorsLink', 'Dónde hemos trabajado: enlace'),
    ]),
    ...inGroup('process', [
      stringField('processTitle', 'Cómo trabajamos: titular'),
      {
        name: 'processPhases',
        title: 'Cómo trabajamos: las seis fases',
        type: 'array',
        validation: (Rule: SanityRule) => Rule.required().length(6),
        of: [
          {
            type: 'object',
            fields: [
              stringField('number', 'Número (01 a 06)'),
              stringField('name', 'Fase'),
              textField('whatWeDo', 'Qué hacemos', {}, 2),
              stringField('quality', 'Control de calidad'),
            ],
            preview: { select: { title: 'name', subtitle: 'quality' } },
          },
        ],
      },
      stringList('processNotes', 'Cómo trabajamos: notas bajo la tabla'),
      linkField('processCta', 'Cómo trabajamos: botón'),
    ]),
    ...inGroup('models', [
      stringField('modelsTitle', 'Modelos de trabajo: titular'),
      titleTextList('models', 'Modelos de trabajo', {}, { title: 'Modelo' }),
    ]),
    ...inGroup('security', [
      stringField('securityTitle', 'Seguridad y gobierno de la IA: titular'),
      titleTextList(
        'securityItems',
        'Seguridad y gobierno de la IA: puntos',
        { description: 'El texto va en minúscula inicial: se lee después de los dos puntos.' },
        { title: 'Tema', text: 'Qué hacemos' },
      ),
    ]),
    ...inGroup('faq', [
      {
        name: 'faq',
        title: 'Preguntas frecuentes',
        type: 'array',
        validation: (Rule: SanityRule) => Rule.required().min(1),
        of: [
          {
            type: 'object',
            fields: [
              stringField('question', 'Pregunta'),
              textField('answer', 'Respuesta', {}, 4),
            ],
            preview: { select: { title: 'question', subtitle: 'answer' } },
          },
        ],
      },
    ]),
    ...inGroup('closing', closingFields({ whatsapp: true })),
  ],
  preview: { prepare: () => ({ title: 'Servicios (página)' }) },
};
