import { describe, expect, it } from 'vitest';
import { fallbackServices } from './content/index.ts';
import { sortServices } from './serviceOrder';
import { stripInlineLinks } from './inlineLinks';
import type { ServiceSchema } from '../types/sanity';

const make = (title: string, order?: number): ServiceSchema => ({
  _id: title,
  title,
  slug: { current: title.toLowerCase() },
  icon: 'code',
  summary: 's',
  pillar: 'construimos',
  whenNeeded: 'w',
  whatWeDo: 'd',
  deliverables: ['x'],
  order,
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

/** Anclas de /servicios acordadas con el cliente (y valores de `?servicio=`). */
const EXPECTED_SLUGS = [
  'desarrollo-software-a-la-medida',
  'integracion-automatizacion-procesos',
  'modernizacion-migracion-sistemas',
  'bizagi',
  'business-intelligence-analitica',
  'automatizacion-documental-ia',
  'asistentes-ia',
  'agentes-ia',
  'modelos-predictivos',
  'integracion-ia-sistemas',
  'mantenimiento-soporte-software',
  'aseguramiento-calidad-qa',
  'outsourcing-talento-ti',
];

describe('fallbackServices (respaldo)', () => {
  it('tiene los 13 servicios con las anclas del cliente, en orden del 1 al 13', () => {
    expect(fallbackServices).toHaveLength(13);
    expect(sortServices(fallbackServices).map((s) => s.slug.current)).toEqual(EXPECTED_SLUGS);
    expect(fallbackServices.map((s) => s.order)).toEqual(
      Array.from({ length: 13 }, (_, i) => i + 1),
    );
  });

  it('reparte los servicios en los tres pilares: 4 + 6 + 3', () => {
    const count = (pillar: string) => fallbackServices.filter((s) => s.pillar === pillar).length;
    expect([count('construimos'), count('aplicamos-ia'), count('operamos')]).toEqual([4, 6, 3]);
  });

  it('usa solo íconos del set de marca', () => {
    const allowed = ['code', 'deploy', 'tasks', 'chart', 'shield-check', 'wrench', 'refresh'];
    for (const s of fallbackServices) expect(allowed, s.slug.current).toContain(s.icon);
  });

  it('cada servicio trae las secciones del modelo (cuándo, qué hacemos, qué recibes)', () => {
    for (const s of fallbackServices) {
      expect(s.whenNeeded, s.slug.current).toBeTruthy();
      expect(s.whatWeDo, s.slug.current).toBeTruthy();
      expect(s.deliverables.length, s.slug.current).toBeGreaterThan(0);
      expect(s.summary.length, s.slug.current).toBeLessThanOrEqual(200);
      expect(s.summary).toBe(s.summary.trim());
      expect(stripInlineLinks(s.whatWeDo).startsWith(s.summary.slice(0, 30))).toBe(true);
    }
  });

  it('solo Bizagi lleva bloques de IA, experiencia y casos típicos', () => {
    const bizagi = fallbackServices.find((s) => s.slug.current === 'bizagi');
    expect(bizagi?.aiCapabilities).toHaveLength(4);
    expect(bizagi?.aiNote).toBeTruthy();
    expect(bizagi?.experience).toContain('/proyectos?servicio=bizagi');
    expect(bizagi?.typicalCases).toBeTruthy();
  });
});
