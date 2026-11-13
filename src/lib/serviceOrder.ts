import type { ServiceSchema } from '../types/sanity';

/** Orden ascendente por `order`; los que no tienen orden van al final, por título. */
export function sortServices(services: ServiceSchema[]): ServiceSchema[] {
  return [...services].sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title, 'es');
  });
}
