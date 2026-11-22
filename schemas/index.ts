import { serviceSchema } from './service';
import { projectSchema } from './project';
import { siteSettingsSchema } from './siteSettings';
import { homePageSchema } from './homePage';
import { servicesPageSchema } from './servicesPage';
import { aboutPageSchema } from './aboutPage';
import { projectsPageSchema } from './projectsPage';
import { whitepaperSchema } from './whitepaper';
import { leadSchema } from './lead';
import { testimonialSchema } from './testimonial';

/**
 * Documentos únicos (singletons): uno solo por tipo, con `_id` igual al nombre
 * del tipo. El Studio (sanity.config.ts / schemas/structure.ts) no permite
 * crearlos de nuevo, duplicarlos ni borrarlos, y el sitio los lee por ese `_id`.
 */
export const SINGLETONS = [
  { type: 'siteSettings', title: 'Ajustes del sitio' },
  { type: 'homePage', title: 'Inicio' },
  { type: 'servicesPage', title: 'Servicios (página)' },
  { type: 'projectsPage', title: 'Proyectos (página)' },
  { type: 'aboutPage', title: 'Nosotros' },
];
export const SINGLETON_TYPES = SINGLETONS.map((s) => s.type);

export const schemaTypes = [
  siteSettingsSchema,
  homePageSchema,
  servicesPageSchema,
  projectsPageSchema,
  aboutPageSchema,
  serviceSchema,
  projectSchema,
  testimonialSchema,
  leadSchema,
  whitepaperSchema,
];
