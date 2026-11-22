/**
 * Reglas puras para combinar lo que devuelve Sanity con el respaldo del código.
 * Viven aparte de `content.ts` (que importa el cliente de Sanity) para poder
 * probarlas sin red.
 */
import { sortByOrder } from './serviceOrder';
import type { ProjectSchema, ServiceSchema } from '../types/sanity';

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
