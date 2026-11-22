/**
 * Carga el contenido del sitio en Sanity (dataset `production`): ajustes, las
 * cuatro páginas, los 13 servicios, los proyectos, los artículos del blog y la
 * versión vigente de la política de datos.
 *
 * El contenido sale de los MISMOS módulos que usa el sitio como respaldo
 * (src/lib/content/), así que lo cargado y el respaldo no se pueden desfasar.
 * Node ejecuta esos módulos .ts directamente (type stripping, Node 22.18+ / 24):
 * por eso solo pueden importar tipos (`import type`) y archivos con extensión.
 *
 * Uso (PowerShell, desde la raíz del proyecto):
 *   node scripts/seed-content.mjs --dry-run      # resumen de lo que haría; no escribe ni necesita token
 *   $env:SANITY_API_WRITE_TOKEN = "<token con permiso Editor>"
 *   node scripts/seed-content.mjs                # carga (se detiene si algún documento ya existe)
 *   node scripts/seed-content.mjs --force        # reemplaza los documentos que ya existan con el mismo _id
 *   node scripts/seed-content.mjs --force --delete-legacy   # además borra los 6 servicios del modelo anterior
 *   Remove-Item Env:SANITY_API_WRITE_TOKEN       # limpia el token de la sesión
 *
 * Reglas de seguridad:
 * - El token solo se lee de la variable de entorno SANITY_API_WRITE_TOKEN (mismo
 *   mecanismo que el script anterior); nunca se imprime ni se guarda. Si lo
 *   tienes en un .env, puedes usar `node --env-file=.env scripts/seed-content.mjs`.
 * - Sin --force, si algún documento destino ya existe el script se detiene y no
 *   escribe nada (así no se pisan los cambios hechos en el Studio).
 * - Los IDs de contenido público no llevan punto (los IDs con punto son privados
 *   en Sanity): `service-<slug>`, `project-<slug>`, `post-<slug>`,
 *   `privacyPolicy-<versión con guiones>` (1.1 → privacyPolicy-1-1) y el nombre
 *   del tipo para los documentos únicos.
 * - Los proyectos pendientes de autorización NO están en el código (repo
 *   público). Se leen de scripts/seed/private/pending-projects.json (archivo
 *   local, ignorado por git) y se cargan como BORRADORES (`drafts.project-*`):
 *   las consultas públicas no los ven. «Autorizar» = publicarlos en el Studio.
 *   Si el archivo no existe, simplemente no se cargan.
 *
 * Mientras el dataset no tenga documentos del modelo nuevo, el sitio usa el
 * respaldo; en cuanto hay al menos un servicio (o proyecto) completo, usa SOLO
 * los de Sanity: por eso todo se carga en una sola transacción.
 */
import { createClient } from '@sanity/client';
import { existsSync, readFileSync } from 'node:fs';
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
} from '../src/lib/content/index.ts';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const force = args.has('--force');
const deleteLegacy = args.has('--delete-legacy');

const projectId = process.env.SANITY_PROJECT_ID || 'xbayv7k2';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

const PENDING_FILE = new URL('./seed/private/pending-projects.json', import.meta.url);

/** Los arreglos de objetos necesitan `_key` para que el Studio los edite sin avisos. */
function withKeys(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      item && typeof item === 'object' && !Array.isArray(item)
        ? { _key: item._key ?? `k${index + 1}`, ...withKeys(item) }
        : item,
    );
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withKeys(v)]));
  }
  return value;
}

function singleton(type, content) {
  return { _id: type, _type: type, ...withKeys(content) };
}

function service(content) {
  const { slug, ...rest } = content;
  delete rest._id; // el _id definitivo es determinista (service-<slug>)
  return {
    _id: `service-${slug.current}`,
    _type: 'service',
    slug: { _type: 'slug', current: slug.current },
    ...withKeys(rest),
  };
}

function project(content, { draft = false } = {}) {
  const { slug, ...rest } = content;
  delete rest._id; // el _id definitivo es determinista (project-<slug>)
  const base = `project-${typeof slug === 'string' ? slug : slug.current}`;
  const current = typeof slug === 'string' ? slug : slug.current;
  return {
    _id: draft ? `drafts.${base}` : base,
    _type: 'project',
    slug: { _type: 'slug', current },
    featuredOnHome: false,
    ...withKeys(rest),
  };
}

function post(content) {
  const { slug, ...rest } = content;
  delete rest._id; // el _id definitivo es determinista (post-<slug>)
  return {
    _id: `post-${slug.current}`,
    _type: 'post',
    slug: { _type: 'slug', current: slug.current },
    ...withKeys(rest),
  };
}

function privacyPolicy(content) {
  const { ...rest } = content;
  delete rest._id; // el _id definitivo sale de la versión (sin puntos)
  return {
    _id: `privacyPolicy-${content.version.replaceAll('.', '-')}`,
    _type: 'privacyPolicy',
    ...withKeys(rest),
  };
}

const publicDocs = [
  singleton('siteSettings', fallbackSiteSettings),
  singleton('homePage', fallbackHomePage),
  singleton('servicesPage', fallbackServicesPage),
  singleton('projectsPage', fallbackProjectsPage),
  singleton('aboutPage', fallbackAboutPage),
  ...fallbackServices.map(service),
  ...fallbackProjects.map((p) => project(p)),
  ...fallbackPosts.map(post),
  ...fallbackPrivacyPolicies.map(privacyPolicy),
];

let pendingDocs = [];
if (existsSync(PENDING_FILE)) {
  const raw = JSON.parse(readFileSync(PENDING_FILE, 'utf8'));
  pendingDocs = raw.map((p) => project({ ...p, authorization: 'pendiente' }, { draft: true }));
}

const docs = [...publicDocs, ...pendingDocs];

// Verificaciones previas: IDs únicos y sin punto en lo público.
const ids = docs.map((d) => d._id);
if (new Set(ids).size !== ids.length) {
  console.error('Hay IDs repetidos entre los documentos a cargar. No se escribió nada.');
  process.exit(1);
}
for (const d of publicDocs) {
  if (d._id.includes('.')) {
    console.error(`El ID público "${d._id}" lleva punto (sería privado en Sanity). Abortado.`);
    process.exit(1);
  }
}

const byType = (type) => publicDocs.filter((d) => d._type === type);

console.log(`Proyecto ${projectId} · dataset ${dataset}`);
console.log(`\nDocumentos únicos (${publicDocs.filter((d) => !d._id.includes('-')).length}):`);
for (const d of publicDocs.filter((x) => ['siteSettings', 'homePage', 'servicesPage', 'projectsPage', 'aboutPage'].includes(x._type))) {
  console.log(`  ${d._type.padEnd(14)} ${d._id}`);
}
console.log(`\nServicios (${byType('service').length}):`);
for (const d of byType('service')) console.log(`  ${String(d.order).padStart(2)}. ${d._id}  [${d.pillar}]`);
console.log(`\nProyectos publicados (${byType('project').length}):`);
for (const d of byType('project')) {
  console.log(`  ${String(d.order).padStart(2)}. ${d._id}${d.featuredOnHome ? '  [inicio]' : ''}`);
}
console.log(`\nArtículos del blog (${byType('post').length}):`);
for (const d of byType('post')) {
  console.log(`  ${d.publishDate}  ${d._id}  (${d.body.length} bloques)`);
}
console.log(`\nVersiones de la política de datos (${byType('privacyPolicy').length}):`);
for (const d of byType('privacyPolicy')) {
  console.log(
    `  v${d.version}  rige desde ${d.effectiveDate}  ${d._id}  (${d.sections.length} secciones)`,
  );
}
console.log(
  `\nProyectos pendientes de autorización: ${pendingDocs.length} borrador(es)` +
    (existsSync(PENDING_FILE) ? ' (desde el archivo local ignorado)' : ' (no hay archivo local: ninguno)'),
);

if (dryRun) {
  console.log('\n--dry-run: no se escribió nada.');
  process.exit(0);
}

if (!token) {
  console.error('\nFalta la variable de entorno SANITY_API_WRITE_TOKEN.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
  perspective: 'raw',
});

const existing = await client.fetch('*[_id in $ids]{_id, _type}', { ids });
if (existing.length > 0 && !force) {
  console.error(`\nYa existen ${existing.length} documento(s) con los IDs a cargar:`);
  for (const e of existing) console.error(`  - ${e._type} ${e._id.startsWith('drafts.') ? '(borrador)' : e._id}`);
  console.error('\nNo se escribió nada. Si quieres reemplazarlos, usa --force.');
  process.exit(1);
}

// Servicios del modelo anterior (6): no se usan (el sitio los ignora) pero se ven en el Studio.
const newServiceIds = new Set(byType('service').map((d) => d._id));
const legacy = (
  await client.fetch('*[_type == "service"]{_id, title}')
).filter((s) => !newServiceIds.has(s._id.replace(/^drafts\./, '')));
if (legacy.length > 0) {
  console.log(`\nServicios del modelo anterior en el dataset (${legacy.length}):`);
  for (const l of legacy) console.log(`  - ${l.title} (${l._id})`);
  console.log(deleteLegacy ? '  Se borrarán (--delete-legacy).' : '  Se conservan; usa --delete-legacy para borrarlos.');
}

let tx = client.transaction();
for (const d of docs) tx = tx.createOrReplace(d);
if (deleteLegacy) for (const l of legacy) tx = tx.delete(l._id);
const result = await tx.commit();

console.log(`\nListo: ${result.results.length} operaciones escritas.`);
console.log(
  'Verifica en el Studio (/admin) y recuerda que el sitio se actualiza cuando se reconstruye (Deploy Hook).',
);
