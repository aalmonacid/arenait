import { PROJECT_CATEGORIES } from './options';
import { closingFields, inGroup, seoFields, stringField, stringList, textField } from './helpers';

/**
 * Página de Proyectos (documento único). Los proyectos son documentos aparte,
 * de tipo «Proyecto»; los sectores de los filtros salen de «Ajustes del sitio».
 */
export const projectsPageSchema = {
  name: 'projectsPage',
  title: 'Proyectos (página)',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Portada y filtros', default: true },
    { name: 'experience', title: 'Franja de experiencia' },
    { name: 'closing', title: 'Cierre' },
    { name: 'seo', title: 'Buscadores' },
  ],
  fields: [
    ...inGroup('seo', seoFields),
    ...inGroup('hero', [
      stringField('heroTitle', 'Portada: titular'),
      textField('heroIntro', 'Portada: texto'),
      stringField('serviceFilterLabel', 'Filtro de servicio: título'),
      stringField('sectorFilterLabel', 'Filtro de sector: título'),
      stringField('allLabel', 'Filtros: texto de «Todos»'),
      {
        name: 'serviceFilters',
        title: 'Filtro de servicio: opciones',
        type: 'array',
        validation: (Rule: any) => Rule.required().min(1),
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'key',
                title: 'Categoría',
                type: 'string',
                options: { list: PROJECT_CATEGORIES, layout: 'dropdown' },
                validation: (Rule: any) => Rule.required(),
              },
              stringField('label', 'Texto del filtro'),
              stringField('groupTitle', 'Encabezado del grupo de proyectos'),
            ],
            preview: { select: { title: 'label', subtitle: 'groupTitle' } },
          },
        ],
      },
      stringField('emptyMessage', 'Aviso cuando no hay proyectos'),
      stringField('emptyLinkLabel', 'Aviso: texto del enlace para ver todos'),
    ]),
    ...inGroup('experience', [
      stringField('experienceBizagiTitle', 'Franja: título de la primera columna'),
      stringList('experienceBizagiItems', 'Franja: temas de la primera columna'),
      stringField('experienceTechTitle', 'Franja: título de la segunda columna'),
      stringList('experienceTechItems', 'Franja: tecnologías'),
    ]),
    ...inGroup('closing', closingFields()),
  ],
  preview: { prepare: () => ({ title: 'Proyectos (página)' }) },
};
