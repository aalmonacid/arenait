import { describe, expect, it } from 'vitest';
import {
  buildQuery,
  cardMatches,
  parseFilterParams,
} from '../../public/scripts/project-filters-logic.js';

const valid = {
  servicio: ['', 'bizagi', 'software-a-la-medida'],
  sector: ['', 'seguros', 'financiero', 'publico', 'farmaceutico', 'agropecuario'],
};

describe('parseFilterParams', () => {
  it('sin parámetros deja los dos filtros en «Todos»', () => {
    expect(parseFilterParams('', valid)).toEqual({ servicio: '', sector: '' });
  });

  it('lee cada filtro por separado y combinados', () => {
    expect(parseFilterParams('?servicio=bizagi', valid)).toEqual({ servicio: 'bizagi', sector: '' });
    expect(parseFilterParams('?sector=publico', valid)).toEqual({ servicio: '', sector: 'publico' });
    expect(parseFilterParams('?servicio=bizagi&sector=seguros', valid)).toEqual({
      servicio: 'bizagi',
      sector: 'seguros',
    });
  });

  it('un valor vacío o desconocido vuelve a «Todos»', () => {
    expect(parseFilterParams('?servicio=&sector=', valid)).toEqual({ servicio: '', sector: '' });
    expect(parseFilterParams('?servicio=xyz&sector=<script>', valid)).toEqual({
      servicio: '',
      sector: '',
    });
  });
});

describe('buildQuery', () => {
  it('queda vacío cuando todo está en «Todos»', () => {
    expect(buildQuery({ servicio: '', sector: '' })).toBe('');
  });

  it('arma el enlace con los filtros activos', () => {
    expect(buildQuery({ servicio: 'bizagi', sector: '' })).toBe('?servicio=bizagi');
    expect(buildQuery({ servicio: 'bizagi', sector: 'seguros' })).toBe(
      '?servicio=bizagi&sector=seguros',
    );
  });
});

describe('cardMatches', () => {
  const card = { servicio: 'bizagi', sector: 'financiero' };

  it('sin filtros muestra todo', () => {
    expect(cardMatches({ servicio: '', sector: '' }, card)).toBe(true);
  });

  it('los dos filtros se combinan (deben cumplirse ambos)', () => {
    expect(cardMatches({ servicio: 'bizagi', sector: 'financiero' }, card)).toBe(true);
    expect(cardMatches({ servicio: 'bizagi', sector: 'seguros' }, card)).toBe(false);
    expect(cardMatches({ servicio: 'software-a-la-medida', sector: '' }, card)).toBe(false);
  });
});
