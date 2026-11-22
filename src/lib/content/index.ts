/**
 * Respaldo del contenido del sitio: la misma forma y el mismo texto que los
 * documentos de Sanity. Lo usan (1) las páginas cuando Sanity no responde o no
 * tiene el documento, y (2) `scripts/seed-content.mjs` para cargar el dataset.
 *
 * Importante para el script de carga: Node lo ejecuta directamente (sin
 * compilar), así que estos módulos solo pueden importar TIPOS (`import type`)
 * y otros módulos con la extensión `.ts` explícita.
 */
export { fallbackSiteSettings } from './settings.ts';
export { fallbackHomePage } from './home.ts';
export { fallbackServices } from './services.ts';
export { fallbackServicesPage } from './servicesPage.ts';
export { fallbackAboutPage } from './about.ts';
export { fallbackProjects } from './projects.ts';
export { fallbackProjectsPage } from './projectsPage.ts';
