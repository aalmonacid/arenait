import { describe, expect, it } from 'vitest';
import { fallbackServices } from './fallbackContent';
import { sortServices } from './serviceOrder';
import type { ServiceSchema } from '../types/sanity';

const make = (title: string, order?: number, featured?: boolean): ServiceSchema => ({
  _id: title,
  title,
  slug: { current: title.toLowerCase() },
  icon: 'code',
  summary: 's',
  description: 'd',
  order,
  featured,
});

describe('sortServices', () => {
  it('ordena de menor a mayor por order', () => {
    const out = sortServices([make('C', 3), make('A', 1), make('B', 2)]);
    expect(out.map((s) => s.title)).toEqual(['A', 'B', 'C']);
  });

  it('manda al final los servicios sin order, ordenados por título', () => {
    const out = sortServices([make('Zeta'), make('B', 2), make('Alfa'), make('A', 1)]);
    expect(out.map((s) => s.title)).toEqual(['A', 'B', 'Alfa', 'Zeta']);
  });

  it('no modifica el arreglo original', () => {
    const input = [make('B', 2), make('A', 1)];
    sortServices(input);
    expect(input.map((s) => s.title)).toEqual(['B', 'A']);
  });

  it('desempata por título cuando el order se repite', () => {
    const out = sortServices([make('B', 1), make('A', 1)]);
    expect(out.map((s) => s.title)).toEqual(['A', 'B']);
  });
});

describe('fallbackServices (respaldo)', () => {
  it('tiene los 6 servicios con orden único del 1 al 6', () => {
    expect(fallbackServices).toHaveLength(6);
    const orders = fallbackServices.map((s) => s.order).sort();
    expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('tiene exactamente 2 destacados (la cuadrícula cierra sin huecos)', () => {
    expect(fallbackServices.filter((s) => s.featured)).toHaveLength(2);
  });

  it('usa solo íconos del set de marca', () => {
    const allowed = ['code', 'deploy', 'tasks', 'chart', 'shield-check', 'wrench', 'refresh'];
    for (const s of fallbackServices) expect(allowed).toContain(s.icon);
  });
});

describe('scripts/seed/services.json (archivo de carga a Sanity)', () => {
  it('coincide con el respaldo: mismo contenido, orden y destacados', async () => {
    const { readFileSync } = await import('node:fs');
    const seed = JSON.parse(readFileSync('scripts/seed/services.json', 'utf8'));
    expect(seed).toHaveLength(fallbackServices.length);
    for (const fb of fallbackServices) {
      const doc = seed.find(
        (d: { slug: { current: string } }) => d.slug.current === fb.slug.current,
      );
      expect(doc, fb.slug.current).toBeTruthy();
      expect(doc._type).toBe('service');
      expect(doc._id).toBe(`service-${fb.slug.current}`);
      expect(doc._id).not.toContain('.');
      expect({
        title: doc.title,
        icon: doc.icon,
        order: doc.order,
        featured: doc.featured,
        summary: doc.summary,
        description: doc.description,
      }).toEqual({
        title: fb.title,
        icon: fb.icon,
        order: fb.order,
        featured: fb.featured,
        summary: fb.summary,
        description: fb.description,
      });
    }
  });
});
