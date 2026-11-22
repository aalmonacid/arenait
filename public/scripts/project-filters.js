// Filtros de /proyectos (mejora progresiva): sin JavaScript se ven todos los
// proyectos y los controles permanecen ocultos. La lógica de parámetros vive en
// project-filters-logic.js (probada con pruebas unitarias).
import { FILTER_KEYS, buildQuery, cardMatches, parseFilterParams } from './project-filters-logic.js';

const root = document.querySelector('[data-project-filters]');

if (root) {
  const buttons = Array.from(root.querySelectorAll('button[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-project]'));
  const groups = Array.from(document.querySelectorAll('[data-project-group]'));
  const empty = document.querySelector('[data-project-empty]');

  const valid = {};
  for (const key of FILTER_KEYS) {
    valid[key] = buttons.filter((b) => b.dataset.filter === key).map((b) => b.dataset.value || '');
  }

  const state = parseFilterParams(window.location.search, valid);

  const apply = () => {
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(state[button.dataset.filter] === button.dataset.value));
    }

    let shown = 0;
    for (const card of cards) {
      const ok = cardMatches(state, { servicio: card.dataset.servicio, sector: card.dataset.sector });
      card.hidden = !ok;
      if (ok) shown += 1;
    }
    for (const group of groups) {
      group.hidden = !group.querySelector('[data-project]:not([hidden])');
    }
    if (empty) empty.hidden = shown > 0;

    // Mantiene el enlace compartible sin crear entradas en el historial.
    window.history.replaceState(null, '', window.location.pathname + buildQuery(state));
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      state[button.dataset.filter] = button.dataset.value || '';
      apply();
    });
  }

  root.hidden = false;
  apply();
}
