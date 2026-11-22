/**
 * Contenido del sitio: lectura desde Sanity con respaldo en el código
 * (`src/lib/content/`).
 *
 * - Páginas y ajustes (singletons): documento cuyo `_id` es el nombre del tipo.
 *   Si no existe o Sanity no responde, se usa el respaldo; si existe pero le
 *   faltan campos, se completan con el respaldo (`mergeContent`).
 * - Servicios y proyectos (colecciones): regla "todo o nada" (`contentRules.ts`).
 *   Los proyectos se consultan SIN borradores y sin token: un caso pendiente de
 *   autorización existe en Sanity solo como borrador y no se publica hasta que
 *   alguien lo publique en el Studio.
 */
import { client } from './sanity';
import {
  fallbackAboutPage,
  fallbackHomePage,
  fallbackProjects,
  fallbackProjectsPage,
  fallbackServices,
  fallbackServicesPage,
  fallbackSiteSettings,
} from './content/index.ts';
import { mergeContent, pickProjects, pickServices } from './contentRules';
import type {
  AboutPage,
  HomePage,
  ProjectSchema,
  ProjectsPage,
  ServiceSchema,
  ServicesPage,
  SiteSettings,
} from '../types/sanity';

const cache = new Map<string, Promise<unknown>>();

/** Una sola consulta por tipo durante el build (el layout la pide en cada página). */
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  let entry = cache.get(key) as Promise<T> | undefined;
  if (!entry) {
    entry = load();
    cache.set(key, entry);
  }
  return entry;
}

function getSingleton<T>(type: string, fallback: T): Promise<T> {
  return once(type, async () => {
    try {
      const doc = await client.fetch(`*[_id == $id && _type == $id][0]`, { id: type });
      return mergeContent(fallback, doc);
    } catch (error) {
      console.error(`Error fetching ${type} from Sanity:`, error);
      return fallback;
    }
  });
}

export const getSiteSettings = () =>
  getSingleton<SiteSettings>('siteSettings', fallbackSiteSettings);
export const getHomePage = () => getSingleton<HomePage>('homePage', fallbackHomePage);
export const getServicesPage = () =>
  getSingleton<ServicesPage>('servicesPage', fallbackServicesPage);
export const getAboutPage = () => getSingleton<AboutPage>('aboutPage', fallbackAboutPage);
export const getProjectsPage = () =>
  getSingleton<ProjectsPage>('projectsPage', fallbackProjectsPage);

export function getServices(): Promise<ServiceSchema[]> {
  return once('services', async () => {
    try {
      const list = await client.fetch<ServiceSchema[]>(
        `*[_type == "service" && !(_id in path("drafts.**"))]`,
      );
      return pickServices(list, fallbackServices);
    } catch (error) {
      console.error('Error fetching services from Sanity:', error);
      return pickServices([], fallbackServices);
    }
  });
}

export function getProjects(): Promise<ProjectSchema[]> {
  return once('projects', async () => {
    try {
      const list = await client.fetch<ProjectSchema[]>(
        `*[_type == "project" && !(_id in path("drafts.**"))]`,
      );
      return pickProjects(list, fallbackProjects);
    } catch (error) {
      console.error('Error fetching projects from Sanity:', error);
      return pickProjects([], fallbackProjects);
    }
  });
}
