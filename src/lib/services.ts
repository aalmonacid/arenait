/**
 * Servicios del sitio: lectura desde Sanity con respaldo en el código y orden
 * único para el inicio y para /servicios.
 *
 * Regla del respaldo (sin cambios): si Sanity no responde o no tiene ningún
 * servicio, se usan los 6 de `fallbackServices`. En cuanto hay al menos uno en
 * Sanity, se usan SOLO los de Sanity — por eso hay que cargar los 6 juntos
 * (ver scripts/seed-services.mjs).
 */
import { client } from './sanity';
import { fallbackServices } from './fallbackContent';
import { sortServices } from './serviceOrder';
import type { ServiceSchema } from '../types/sanity';

export async function getServices(): Promise<ServiceSchema[]> {
  let services: ServiceSchema[] = [];

  try {
    services = await client.fetch<ServiceSchema[]>(`*[_type == "service"]`);
  } catch (error) {
    console.error('Error fetching services from Sanity:', error);
  }

  if (!services || services.length === 0) {
    services = fallbackServices;
  }

  return sortServices(services);
}
