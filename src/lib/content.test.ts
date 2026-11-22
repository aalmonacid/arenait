import { describe, expect, it } from 'vitest';
import {
  fallbackAboutPage,
  fallbackHomePage,
  fallbackProjects,
  fallbackProjectsPage,
  fallbackServices,
  fallbackServicesPage,
  fallbackSiteSettings,
} from './content/index.ts';
import { isCompleteProject, mergeContent, pickProjects, pickServices } from './contentRules';
import { parseInlineLinks, stripInlineLinks } from './inlineLinks';
import type { ProjectSchema, ServiceSchema } from '../types/sanity';

const allContent = {
  fallbackSiteSettings,
  fallbackHomePage,
  fallbackServicesPage,
  fallbackAboutPage,
  fallbackProjectsPage,
  fallbackServices,
  fallbackProjects,
};

describe('respaldo de contenido: guía de estilo del cliente', () => {
  const json = JSON.stringify(allContent);

  it('no usa rayas (—) en el texto publicable', () => {
    expect(json).not.toContain('—');
  });

  it('escribe la marca como «Arena IT» (con espacio)', () => {
    expect(json).not.toContain('ArenaIT');
    expect(fallbackSiteSettings.siteName).toBe('Arena IT');
    expect(fallbackSiteSettings.tagline).toBe('Arena IT · Tecnología para la operación diaria.');
  });

  it('no publica certificaciones, SLA con cifras ni ahorros', () => {
    expect(json).not.toMatch(/ISO ?27001|TOGAF|99[.,]9|TCO/);
  });

  it('no enlaza al PDF del portafolio (todavía no se publica)', () => {
    expect(json).not.toContain('portafolio');
  });
});

describe('respaldo de contenido: enlaces internos', () => {
  const slugs = new Set(fallbackServices.map((s) => s.slug.current));
  const pillarKeys = new Set(fallbackServicesPage.pillars.map((p) => p.key));

  it('los enlaces dentro de los textos de servicios apuntan a anclas que existen', () => {
    for (const s of fallbackServices) {
      const texts = [s.whenNeeded, s.whatWeDo, s.aiNote, s.experience, s.typicalCases];
      for (const text of texts.filter(Boolean) as string[]) {
        for (const seg of parseInlineLinks(text)) {
          if (seg.href?.startsWith('#')) expect(slugs.has(seg.href.slice(1)), seg.href).toBe(true);
        }
      }
    }
  });

  it('el servicio de cada proyecto y los pilares del inicio apuntan a anclas que existen', () => {
    for (const p of fallbackProjects) {
      expect(slugs.has(p.serviceAnchor), p.serviceAnchor).toBe(true);
      if (p.secondaryServiceAnchor) expect(slugs.has(p.secondaryServiceAnchor)).toBe(true);
    }
    for (const pillar of fallbackHomePage.pillars) expect(pillarKeys.has(pillar.key)).toBe(true);
  });

  it('los sectores de los proyectos existen en los ajustes', () => {
    const keys = new Set(fallbackSiteSettings.sectors.map((s) => s.key));
    expect(keys.size).toBe(5);
    for (const p of fallbackProjects) expect(keys.has(p.sector), p.slug.current).toBe(true);
  });

  it('las fases del proceso son seis en el inicio y en /servicios', () => {
    expect(fallbackHomePage.processSteps).toHaveLength(6);
    expect(fallbackServicesPage.processPhases).toHaveLength(6);
  });
});

describe('fallbackProjects (respaldo)', () => {
  it('tiene solo los 9 casos publicables (los pendientes no están en el código)', () => {
    expect(fallbackProjects.map((p) => p.order)).toEqual([4, 5, 6, 8, 10, 11, 12, 13, 14]);
    for (const p of fallbackProjects) {
      expect(p.authorization, p.slug.current).not.toBe('pendiente');
      expect(isCompleteProject(p), p.slug.current).toBe(true);
    }
  });

  it('tiene 3 destacados en el inicio, cada uno con resumen', () => {
    const featured = fallbackProjects
      .filter((p) => p.featuredOnHome)
      .sort((a, b) => (a.homeOrder ?? 99) - (b.homeOrder ?? 99));
    // Orden del borrador del cliente: 5, 4, 8.
    expect(featured.map((p) => p.order)).toEqual([5, 4, 8]);
    for (const p of featured) expect(p.homeSummary).toBeTruthy();
  });

  it('los slugs son únicos y sin punto', () => {
    const slugs = fallbackProjects.map((p) => p.slug.current);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});

describe('mergeContent', () => {
  const fallback = {
    title: 'T',
    items: ['a', 'b'],
    link: { label: 'L', href: '/x' },
    opt: 'o',
  };

  it('devuelve el respaldo si no hay documento', () => {
    expect(mergeContent(fallback, null)).toBe(fallback);
    expect(mergeContent(fallback, undefined)).toBe(fallback);
  });

  it('completa campos vacíos o ausentes y conserva lo editado', () => {
    const out = mergeContent(fallback, { title: 'Nuevo', items: [], link: { label: 'Otro' }, opt: '' });
    expect(out.title).toBe('Nuevo');
    expect(out.items).toEqual(['a', 'b']);
    expect(out.link).toEqual({ label: 'Otro', href: '/x' });
    expect(out.opt).toBe('o');
  });

  it('usa las listas del documento cuando tienen contenido', () => {
    expect(mergeContent(fallback, { items: ['z'] }).items).toEqual(['z']);
  });
});

describe('pickServices / pickProjects (regla todo o nada)', () => {
  const legacy = { _id: 'service-viejo', title: 'Viejo', slug: { current: 'viejo' }, summary: 's' };

  it('ignora los servicios del modelo anterior y usa el respaldo', () => {
    const out = pickServices([legacy], fallbackServices);
    expect(out).toHaveLength(13);
  });

  it('usa solo los de Sanity en cuanto hay uno completo', () => {
    const complete: ServiceSchema = { ...fallbackServices[0], _id: 'service-x', order: 1 };
    const out = pickServices([legacy, complete], fallbackServices);
    expect(out.map((s) => s._id)).toEqual(['service-x']);
  });

  it('sin respuesta de Sanity usa el respaldo, en orden', () => {
    expect(pickServices(null, fallbackServices).map((s) => s.order)).toEqual(
      Array.from({ length: 13 }, (_, i) => i + 1),
    );
    expect(pickProjects([], fallbackProjects)).toHaveLength(9);
  });

  it('ordena los proyectos de Sanity por order y descarta los incompletos', () => {
    const a: ProjectSchema = { ...fallbackProjects[1], _id: 'p-a', order: 2 };
    const b: ProjectSchema = { ...fallbackProjects[0], _id: 'p-b', order: 1 };
    const broken = { _id: 'p-c', title: 'Incompleto' };
    expect(pickProjects([a, broken, b], fallbackProjects).map((p) => p._id)).toEqual([
      'p-b',
      'p-a',
    ]);
  });
});

describe('enlaces dentro de los textos', () => {
  it('convierte [texto](/ruta) y [texto](#ancla) en enlaces', () => {
    expect(parseInlineLinks('Ver [Bizagi](#bizagi) y [más](/proyectos?servicio=bizagi).')).toEqual([
      { text: 'Ver ' },
      { text: 'Bizagi', href: '#bizagi' },
      { text: ' y ' },
      { text: 'más', href: '/proyectos?servicio=bizagi' },
      { text: '.' },
    ]);
  });

  it('descarta destinos externos o peligrosos y deja solo el texto', () => {
    expect(parseInlineLinks('[x](https://malo.example) [y](javascript:alert) [z](//malo.example)')).toEqual(
      [{ text: 'x' }, { text: ' ' }, { text: 'y' }, { text: ' ' }, { text: 'z' }],
    );
  });

  it('stripInlineLinks quita la marca de enlaces', () => {
    expect(stripInlineLinks('Como [Bizagi](#bizagi).')).toBe('Como Bizagi.');
  });
});
