/**
 * Contenido del sitio: lectura desde Sanity con respaldo en el código
 * (`src/lib/content/`).
 *
 * - Páginas y ajustes (singletons): documento cuyo `_id` es el nombre del tipo.
 *   Si no existe o Sanity no responde, se usa el respaldo; si existe pero le
 *   faltan campos, se completan con el respaldo (`mergeContent`).
 * - Servicios, proyectos, artículos del blog y versiones de la política (colecciones): regla "todo o nada" (`contentRules.ts`).
 *   Los proyectos se consultan SIN borradores y sin token: un caso pendiente de
 *   autorización existe en Sanity solo como borrador y no se publica hasta que
 *   alguien lo publique en el Studio.
 */
import { client } from './sanity';
import {
  fallbackAboutPage,
  fallbackHomePage,
  fallbackPosts,
  fallbackPrivacyPolicies,
  fallbackProjects,
  fallbackProjectsPage,
  fallbackServices,
  fallbackServicesPage,
  fallbackSiteSettings,
} from './content/index.ts';
import {
  mergeContent,
  pickPolicies,
  pickPosts,
  pickProjects,
  pickServices,
  selectCurrentPolicy,
  todayInBogota,
} from './contentRules';
import type {
  AboutPage,
  HomePage,
  PostSchema,
  PrivacyPolicy,
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

export function getPosts(): Promise<PostSchema[]> {
  return once('posts', async () => {
    try {
      const list = await client.fetch<PostSchema[]>(
        `*[_type == "post" && !(_id in path("drafts.**"))]`,
      );
      return pickPosts(list, fallbackPosts);
    } catch (error) {
      console.error('Error fetching posts from Sanity:', error);
      return pickPosts([], fallbackPosts);
    }
  });
}

export interface PolicyData {
  /** Todas las versiones publicadas (la más reciente primero), incluida la vigente. */
  all: PrivacyPolicy[];
  /** La versión que rige hoy (fecha del build, zona America/Bogota). */
  current: PrivacyPolicy;
  /** Fecha del build (AAAA-MM-DD) con la que se decidió cuál rige. */
  today: string;
}

/**
 * Versiones de la política de datos. Una sola consulta por build: la página de
 * la política y el formulario de contacto (`data-policy-version`) leen la misma
 * versión vigente, así no se pueden desfasar.
 */
export function getPolicies(): Promise<PolicyData> {
  return once('policies', async () => {
    const today = todayInBogota();
    let list: PrivacyPolicy[];
    try {
      const raw = await client.fetch<PrivacyPolicy[]>(
        `*[_type == "privacyPolicy" && !(_id in path("drafts.**"))]`,
      );
      list = pickPolicies(raw, fallbackPrivacyPolicies);
    } catch (error) {
      console.error('Error fetching privacyPolicy from Sanity:', error);
      list = pickPolicies([], fallbackPrivacyPolicies);
    }
    let current = selectCurrentPolicy(list, today);
    if (!current) {
      // Todas las versiones de Sanity tienen fecha futura: rige la del respaldo.
      const [backup] = pickPolicies([], fallbackPrivacyPolicies);
      current = backup;
      list = [...list, backup];
    }
    return { all: list, current, today };
  });
}

export const getCurrentPolicy = async () => (await getPolicies()).current;
