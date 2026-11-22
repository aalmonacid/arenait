import {
  closingFields,
  inGroup,
  seoFields,
  stringField,
  stringList,
  textField,
  titleTextList,
} from './helpers';

/** Página Nosotros (documento único). */
export const aboutPageSchema = {
  name: 'aboutPage',
  title: 'Nosotros',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Portada', default: true },
    { name: 'who', title: 'Quiénes somos' },
    { name: 'mission', title: 'Misión y visión' },
    { name: 'principles', title: 'Principios' },
    { name: 'closing', title: 'Sectores y cierre' },
    { name: 'seo', title: 'Buscadores' },
  ],
  fields: [
    ...inGroup('seo', seoFields),
    ...inGroup('hero', [
      stringField('heroEyebrow', 'Portada: etiqueta'),
      stringField('heroTitle', 'Portada: titular'),
      textField('heroIntro', 'Portada: texto'),
    ]),
    ...inGroup('who', [
      stringField('whoTitle', 'Quiénes somos: titular'),
      stringList('whoParagraphs', 'Quiénes somos: párrafos'),
    ]),
    ...inGroup('mission', [
      stringField('missionVisionTitle', 'Misión y visión: titular'),
      textField('mission', 'Misión'),
      textField('vision', 'Visión'),
    ]),
    ...inGroup('principles', [
      stringField('principlesTitle', 'Principios: titular'),
      titleTextList('principles', 'Principios', {}, { title: 'Principio' }),
    ]),
    ...inGroup('closing', [
      stringField('sectorsTitle', 'Sectores: titular'),
      ...closingFields(),
    ]),
  ],
  preview: { prepare: () => ({ title: 'Nosotros' }) },
};
