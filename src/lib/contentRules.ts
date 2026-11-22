/**
 * Reglas puras para combinar lo que devuelve Sanity con el respaldo del código.
 * Viven aparte de `content.ts` (que importa el cliente de Sanity) para poder
 * probarlas sin red.
 */
import { sortByOrder } from './serviceOrder';
import { POLICY_URL } from './legal';
import type { PostSchema, PrivacyPolicy, ProjectSchema, ServiceSchema } from '../types/sanity';

const PILLARS = ['construimos', 'aplicamos-ia', 'operamos'];
const SECTORS = ['seguros', 'financiero', 'publico', 'farmaceutico', 'agropecuario'];
const CATEGORIES = ['bizagi', 'software-a-la-medida'];

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Documento de Sanity + respaldo: lo que falte en el documento (campo vacío,
 * lista vacía) se completa con el respaldo, así un campo borrado por error en el
 * Studio no rompe la página. Los objetos se combinan campo a campo; las listas
 * se toman completas de donde haya contenido.
 */
export function mergeContent<T>(fallback: T, doc: unknown): T {
  if (!isPlainObject(doc)) return fallback;
  const result: Record<string, unknown> = { ...doc };
  for (const [key, fb] of Object.entries(fallback as Record<string, unknown>)) {
    const value = doc[key];
    if (value === null || value === undefined || value === '') {
      result[key] = fb;
    } else if (Array.isArray(fb)) {
      result[key] = Array.isArray(value) && value.length > 0 ? value : fb;
    } else if (isPlainObject(fb) && isPlainObject(value)) {
      result[key] = mergeContent(fb, value);
    }
  }
  return result as T;
}

/** Un servicio de Sanity sirve para el sitio solo si trae los campos del modelo nuevo. */
export function isCompleteService(
  s: Partial<ServiceSchema> | null | undefined,
): s is ServiceSchema {
  return Boolean(
    s &&
      s.title &&
      s.slug?.current &&
      s.pillar &&
      PILLARS.includes(s.pillar) &&
      s.summary &&
      s.whenNeeded &&
      s.whatWeDo &&
      Array.isArray(s.deliverables) &&
      s.deliverables.length > 0,
  );
}

/**
 * Regla "todo o nada": si Sanity no tiene ningún servicio completo se usan los
 * del respaldo; en cuanto hay al menos uno, se usan SOLO los de Sanity (por eso
 * se cargan los 13 juntos). Los documentos del modelo anterior (sin pilar ni
 * secciones) se ignoran.
 */
export function pickServices(
  fromSanity: Partial<ServiceSchema>[] | null | undefined,
  fallback: ServiceSchema[],
): ServiceSchema[] {
  const complete = (fromSanity ?? []).filter(isCompleteService);
  return sortByOrder(complete.length > 0 ? complete : fallback);
}

export function isCompleteProject(
  p: Partial<ProjectSchema> | null | undefined,
): p is ProjectSchema {
  return Boolean(
    p &&
      p.title &&
      p.slug?.current &&
      p.client &&
      p.sector &&
      SECTORS.includes(p.sector) &&
      p.category &&
      CATEGORIES.includes(p.category) &&
      p.serviceLabel &&
      p.serviceAnchor &&
      p.challenge &&
      Array.isArray(p.whatWeDid) &&
      p.whatWeDid.length > 0 &&
      p.result,
  );
}

/** Misma regla "todo o nada" para los proyectos publicados. */
export function pickProjects(
  fromSanity: Partial<ProjectSchema>[] | null | undefined,
  fallback: ProjectSchema[],
): ProjectSchema[] {
  const complete = (fromSanity ?? []).filter(isCompleteProject);
  return sortByOrder(complete.length > 0 ? complete : fallback);
}

/* ---------- Blog ---------- */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const hasContent = (body: unknown): boolean => Array.isArray(body) && body.length > 0;

/** Un artículo de Sanity sirve para el sitio solo si trae lo necesario para publicarse. */
export function isCompletePost(p: Partial<PostSchema> | null | undefined): p is PostSchema {
  return Boolean(
    p &&
      p.title &&
      p.slug?.current &&
      SLUG.test(p.slug.current) &&
      p.description &&
      p.publishDate &&
      ISO_DATE.test(p.publishDate) &&
      hasContent(p.body),
  );
}

/**
 * Misma regla "todo o nada": sin ningún artículo completo en Sanity se usan los
 * del respaldo; en cuanto hay uno, solo los de Sanity. Orden: el más reciente primero.
 */
export function pickPosts(
  fromSanity: Partial<PostSchema>[] | null | undefined,
  fallback: PostSchema[],
): PostSchema[] {
  const complete = (fromSanity ?? []).filter(isCompletePost);
  return [...(complete.length > 0 ? complete : fallback)].sort(
    (a, b) => b.publishDate.localeCompare(a.publishDate) || a.title.localeCompare(b.title, 'es'),
  );
}

/* ---------- Política de datos (una versión por documento) ---------- */

/** Fecha de hoy (AAAA-MM-DD) en Colombia: con ella se decide qué versión ya rige. */
export function todayInBogota(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** AAAA-MM-DD → DD/MM/AAAA. */
export function formatIsoDate(iso: string): string {
  return iso.split('-').reverse().join('/');
}

/** `1.1` → `version-1-1` (parte final de la URL de esa versión). */
export function policyVersionSlug(version: string): string {
  return `version-${version
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
}

export const policyVersionPath = (version: string) =>
  `${POLICY_URL}/${policyVersionSlug(version)}`;

export function isCompletePolicy(
  p: Partial<PrivacyPolicy> | null | undefined,
): p is PrivacyPolicy {
  return Boolean(
    p &&
      p.version &&
      /^[0-9]+(\.[0-9]+)*$/.test(p.version.trim()) &&
      p.effectiveDate &&
      ISO_DATE.test(p.effectiveDate) &&
      Array.isArray(p.sections) &&
      p.sections.length > 0 &&
      p.sections.every((s) => s && s.title),
  );
}

/** Más reciente primero (fecha de entrada en vigor; a igual fecha, el número de versión mayor). */
const byNewest = (a: PrivacyPolicy, b: PrivacyPolicy) =>
  b.effectiveDate.localeCompare(a.effectiveDate) ||
  b.version.localeCompare(a.version, 'en', { numeric: true });

/**
 * Regla "todo o nada" con las versiones de la política: sin ninguna versión
 * completa en Sanity, se usa el respaldo; en cuanto hay una, solo las de Sanity.
 * Si dos documentos repiten el número de versión, se conserva el más reciente.
 */
export function pickPolicies(
  fromSanity: Partial<PrivacyPolicy>[] | null | undefined,
  fallback: PrivacyPolicy[],
): PrivacyPolicy[] {
  const complete = (fromSanity ?? []).filter(isCompletePolicy);
  const sorted = [...(complete.length > 0 ? complete : fallback)].sort(byNewest);
  const seen = new Set<string>();
  return sorted.filter((p) => {
    const key = policyVersionSlug(p.version);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Versión vigente: la de `effectiveDate` más reciente que no sea futura
 * (`today` en AAAA-MM-DD, zona America/Bogota). Sin ninguna que ya rija, undefined.
 */
export function selectCurrentPolicy(
  policies: PrivacyPolicy[],
  today: string,
): PrivacyPolicy | undefined {
  return [...policies].filter((p) => p.effectiveDate <= today).sort(byNewest)[0];
}

/** AAAA-MM-DD → «4 de septiembre de 2026» (sin depender de la zona horaria del build). */
export function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
