import type { ProjectsPage } from '../../types/sanity';

/** Respaldo de /proyectos (documento `projectsPage` en Sanity). */
export const fallbackProjectsPage: ProjectsPage = {
  seoTitle: 'Proyectos en Bizagi y software a la medida',
  seoDescription:
    'Proyectos en Bizagi, software a la medida y migración de datos para los sectores asegurador, financiero, público, farmacéutico y agropecuario.',

  heroTitle: 'Proyectos que hemos entregado.',
  heroIntro:
    'Implementamos, soportamos y optimizamos procesos en Bizagi, desarrollamos software a la medida y migramos datos para organizaciones de los sectores asegurador, financiero, público, farmacéutico y agropecuario.',

  serviceFilterLabel: 'Filtrar por servicio',
  sectorFilterLabel: 'Filtrar por sector',
  allLabel: 'Todos',
  serviceFilters: [
    { key: 'bizagi', label: 'Bizagi', groupTitle: 'Proyectos Bizagi' },
    {
      key: 'software-a-la-medida',
      label: 'Software a la medida',
      groupTitle: 'Proyectos de software a la medida',
    },
  ],

  experienceBizagiTitle: 'Bizagi',
  experienceBizagiItems: [
    'Implementación',
    'Soporte',
    'Migración a la nube',
    'Desempeño',
    'Carga de datos',
    'Transferencia de conocimiento',
  ],
  experienceTechTitle: 'Tecnologías',
  experienceTechItems: ['Bizagi', '.NET', 'Angular', 'Android nativo', 'SQL Server'],

  emptyMessage: 'No hay proyectos con estos filtros.',
  emptyLinkLabel: 'Ver todos los proyectos',

  closingTitle: '¿Tu proyecto se parece a alguno de estos?',
  closingText: 'Cuéntanos tu reto y te decimos cómo lo abordaríamos.',
  closingLinks: [
    { label: 'Cuéntanos tu reto', href: '/contacto' },
    { label: 'Ver servicios', href: '/servicios' },
  ],
};
