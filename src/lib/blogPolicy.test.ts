import { describe, expect, it } from 'vitest';
import { fallbackPosts, fallbackPrivacyPolicies } from './content/index.ts';
import {
  formatIsoDate,
  formatLongDate,
  isCompletePost,
  pickPolicies,
  pickPosts,
  policyVersionPath,
  policyVersionSlug,
  selectCurrentPolicy,
  todayInBogota,
} from './contentRules';
import { portableTextToHtml } from './portableText';
import type { PostSchema, PrivacyPolicy } from '../types/sanity';

const post = (over: Partial<PostSchema> = {}): PostSchema => ({
  title: 'Artículo de prueba',
  slug: { current: 'articulo-de-prueba' },
  description: 'Resumen.',
  publishDate: '2026-10-01',
  body: [
    {
      _type: 'block',
      style: 'normal',
      children: [{ _type: 'span', text: 'Hola', marks: [] }],
    },
  ],
  ...over,
});

const policy = (version: string, effectiveDate: string): PrivacyPolicy => ({
  version,
  effectiveDate,
  sections: [{ title: '1. Algo' }],
});

describe('blog: regla «todo o nada»', () => {
  it('el respaldo conserva los 2 artículos actuales, con las mismas URL', () => {
    expect(fallbackPosts.map((p) => p.slug.current).sort()).toEqual([
      'desarrollo-a-la-medida-vs-erp-saas-generico',
      'senales-sistema-necesita-mantenimiento-no-rewrite',
    ]);
    expect(fallbackPosts.every(isCompletePost)).toBe(true);
  });

  it('el respaldo se convierte a HTML sin perder el formato (h2, negrita, listas)', () => {
    const html = portableTextToHtml(fallbackPosts[0].body, { imageUrl: () => undefined });
    expect(html).toContain('<h2>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<ol>');
    expect(html).not.toContain('**');
  });

  it('sin artículos completos en Sanity se usa el respaldo', () => {
    expect(pickPosts([], fallbackPosts)).toHaveLength(2);
    expect(pickPosts(null, fallbackPosts)).toHaveLength(2);
    // Incompletos (sin cuerpo, sin resumen, slug con mayúsculas o fecha mal escrita) se ignoran.
    const incompletos = [
      post({ body: [] }),
      post({ description: '' }),
      post({ slug: { current: 'Con Espacios' } }),
      post({ publishDate: '4/9/2026' }),
    ];
    expect(pickPosts(incompletos, fallbackPosts)).toHaveLength(2);
  });

  it('con al menos un artículo completo en Sanity, solo se usan los de Sanity (más reciente primero)', () => {
    const viejo = post({ slug: { current: 'viejo' }, publishDate: '2026-01-10' });
    const nuevo = post({ slug: { current: 'nuevo' }, publishDate: '2026-11-01' });
    const result = pickPosts([viejo, post({ body: [] }), nuevo], fallbackPosts);
    expect(result.map((p) => p.slug.current)).toEqual(['nuevo', 'viejo']);
  });
});

describe('política: versión vigente', () => {
  it('ignora las versiones con fecha futura y elige la más reciente que ya rige', () => {
    const list = [
      policy('1.0', '2026-01-01'),
      policy('1.1', '2026-11-15'),
      policy('2.0', '2027-03-01'),
    ];
    expect(selectCurrentPolicy(list, '2026-11-22')?.version).toBe('1.1');
    expect(selectCurrentPolicy(list, '2027-03-01')?.version).toBe('2.0');
    expect(selectCurrentPolicy(list, '2026-11-14')?.version).toBe('1.0');
    expect(selectCurrentPolicy(list, '2025-12-31')).toBeUndefined();
  });

  it('a igual fecha gana el número de versión mayor (comparación numérica)', () => {
    const list = [policy('1.9', '2026-11-15'), policy('1.10', '2026-11-15')];
    expect(selectCurrentPolicy(list, '2026-11-15')?.version).toBe('1.10');
  });

  it('el respaldo es la v1.1 del 15/11/2026 con las anclas #cookies y #encargados', () => {
    const [v11] = pickPolicies([], fallbackPrivacyPolicies);
    expect(v11.version).toBe('1.1');
    expect(formatIsoDate(v11.effectiveDate)).toBe('15/11/2026');
    const anchors = v11.sections.map((s) => s.anchor).filter(Boolean);
    expect(anchors).toContain('cookies');
    expect(anchors).toContain('encargados');
    expect(selectCurrentPolicy([v11], '2026-11-22')?.version).toBe('1.1');
  });

  it('pickPolicies: todo o nada, descarta incompletas y repetidas', () => {
    expect(pickPolicies([], fallbackPrivacyPolicies)).toHaveLength(1);
    const incompleta = { version: '9.9', effectiveDate: '2026-12-01', sections: [] };
    expect(pickPolicies([incompleta], fallbackPrivacyPolicies)[0].version).toBe('1.1');
    const result = pickPolicies(
      [policy('2.0', '2026-12-01'), policy('2.0', '2026-12-05'), policy('1.0', '2026-01-01')],
      fallbackPrivacyPolicies,
    );
    expect(result.map((p) => `${p.version}@${p.effectiveDate}`)).toEqual([
      '2.0@2026-12-05',
      '1.0@2026-01-01',
    ]);
  });

  it('las URL por versión cambian los puntos por guiones', () => {
    expect(policyVersionSlug('1.1')).toBe('version-1-1');
    expect(policyVersionSlug(' 2.10.3 ')).toBe('version-2-10-3');
    expect(policyVersionPath('1.1')).toBe('/politica-de-tratamiento-de-datos/version-1-1');
  });
});

describe('fechas', () => {
  it('«hoy» se calcula en America/Bogota (UTC-5), no en UTC', () => {
    expect(todayInBogota(new Date('2026-11-23T03:00:00Z'))).toBe('2026-11-22');
    expect(todayInBogota(new Date('2026-11-23T05:00:00Z'))).toBe('2026-11-23');
  });

  it('la fecha larga del blog no depende de la zona horaria del build', () => {
    expect(formatLongDate('2026-09-04')).toBe('4 de septiembre de 2026');
  });
});
