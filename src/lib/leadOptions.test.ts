import { describe, expect, it } from 'vitest';
import { fallbackServices } from './content/index.ts';
import {
  INTEREST_MODEL_OPTIONS,
  SERVICE_OPTIONS,
  SERVICE_OPTION_GROUPS,
  interestModelLabel,
  isKnownService,
  serviceLabel,
} from './leadOptions';

describe('leadOptions (fuente única del formulario)', () => {
  it('incluye todos los servicios del respaldo, con el mismo título y en su pilar', () => {
    for (const s of fallbackServices) {
      expect(isKnownService(s.slug.current), s.slug.current).toBe(true);
      expect(serviceLabel(s.slug.current)).toBe(s.title);
    }
    const groupOf = (slug: string) =>
      SERVICE_OPTION_GROUPS.find((g) => g.options.some((o) => o.value === slug))?.group;
    const names = { construimos: 'Construimos', 'aplicamos-ia': 'Aplicamos IA', operamos: 'Operamos' };
    for (const s of fallbackServices) expect(groupOf(s.slug.current)).toBe(names[s.pillar]);
  });

  it('suma Diagnóstico y Otro: 15 opciones sin repetidos', () => {
    expect(SERVICE_OPTIONS).toHaveLength(15);
    expect(new Set(SERVICE_OPTIONS.map((o) => o.value)).size).toBe(15);
    expect(isKnownService('diagnostico') && isKnownService('otro')).toBe(true);
  });

  it('tiene los seis modelos de interés con los códigos del cliente', () => {
    expect(INTEREST_MODEL_OPTIONS.map((o) => o.value)).toEqual([
      'proyecto-alcance-definido',
      'celula-dedicada',
      'outsourcing-talento-ti',
      'bolsa-de-horas',
      'mantenimiento-soporte',
      'no-se',
    ]);
  });

  it('devuelve el valor tal cual si no está en la lista', () => {
    expect(serviceLabel('Título viejo')).toBe('Título viejo');
    expect(interestModelLabel('x')).toBe('x');
  });
});
