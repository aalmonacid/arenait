/**
 * Lógica pura de los filtros de /proyectos (sin DOM): se importa desde
 * /scripts/project-filters.js en el navegador y desde las pruebas unitarias.
 *
 * Dos filas combinables (servicio y sector), una opción por fila, con enlace
 * directo `?servicio=&sector=`. Sin parámetro, o con un valor que no existe,
 * el filtro queda en "Todos" (cadena vacía).
 */

export const FILTER_KEYS = ['servicio', 'sector'];

/**
 * @param {string} search  Cadena de consulta (`location.search`).
 * @param {Record<string, string[]>} valid  Valores válidos por filtro (los de los botones).
 * @returns {{ servicio: string, sector: string }}
 */
export function parseFilterParams(search, valid) {
  const params = new URLSearchParams(search);
  const state = { servicio: '', sector: '' };
  for (const key of FILTER_KEYS) {
    const value = params.get(key) || '';
    state[key] = value !== '' && (valid[key] || []).includes(value) ? value : '';
  }
  return state;
}

/**
 * Cadena de consulta para el estado actual: vacía cuando todo está en "Todos".
 * @param {{ servicio: string, sector: string }} state
 */
export function buildQuery(state) {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    if (state[key]) params.set(key, state[key]);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * ¿La tarjeta cumple ambos filtros?
 * @param {{ servicio: string, sector: string }} state
 * @param {{ servicio?: string, sector?: string }} card
 */
export function cardMatches(state, card) {
  return (
    (!state.servicio || card.servicio === state.servicio) &&
    (!state.sector || card.sector === state.sector)
  );
}
