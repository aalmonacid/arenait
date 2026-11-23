import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  blogPostingSchema,
  breadcrumbSchema,
  collectionPageSchema,
  faqPageSchema,
  jsonLdString,
  organizationSchema,
  serviceListSchema,
  webSiteSchema,
} from './structuredData';

const ORIGIN = 'https://example.test';

const FORBIDDEN =
  /aggregateRating|ratingValue|reviewCount|award|hasCredential|iso\s?27001|partner|price|offers|"review"/i;

describe('jsonLdString', () => {
  it('escapa «<» para que no se pueda cerrar el script', () => {
    const out = jsonLdString({ name: '</script><img src=x onerror=alert(1)>' });
    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c/script>');
    expect(JSON.parse(out).name).toBe('</script><img src=x onerror=alert(1)>');
  });

  it('escapa los separadores de línea U+2028 y U+2029', () => {
    const separators = String.fromCharCode(0x2028, 0x2029);
    const out = jsonLdString({ a: `x${separators}z` });
    expect(out).not.toContain(separators[0]);
    expect(out).not.toContain(separators[1]);
    expect(JSON.parse(out).a).toBe(`x${separators}z`);
  });
});

describe('absoluteUrl', () => {
  it('une origen y ruta', () => {
    expect(absoluteUrl(ORIGIN, '/blog/x')).toBe('https://example.test/blog/x');
    expect(absoluteUrl(`${ORIGIN}/`, '/')).toBe('https://example.test/');
  });
});

describe('organizationSchema / webSiteSchema', () => {
  it('incluye los campos dados', () => {
    const org = organizationSchema({
      name: 'Arena IT',
      url: ORIGIN,
      description: 'Desde 2013, software.',
      logo: `${ORIGIN}/logo.png`,
      foundingDate: '2013',
      sameAs: ['https://example.test/perfil'],
    });
    expect(org).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Arena IT',
      foundingDate: '2013',
      sameAs: ['https://example.test/perfil'],
    });
    expect(webSiteSchema({ name: 'Arena IT', url: ORIGIN })).toMatchObject({
      '@type': 'WebSite',
      name: 'Arena IT',
      url: ORIGIN,
    });
  });

  it('omite opcionales ausentes, vacíos o sameAs vacío', () => {
    const org = organizationSchema({
      name: 'Arena IT',
      url: ORIGIN,
      description: '  ',
      logo: undefined,
      sameAs: [],
    });
    expect(Object.keys(org).sort()).toEqual(['@context', '@type', 'name', 'url']);
    expect(webSiteSchema({ name: 'Arena IT', url: ORIGIN, inLanguage: '' })).not.toHaveProperty(
      'inLanguage',
    );
  });
});

describe('blogPostingSchema', () => {
  const base = {
    headline: 'Título',
    datePublished: '2026-11-01',
    publisherName: 'Arena IT',
    publisherUrl: ORIGIN,
    url: `${ORIGIN}/blog/titulo`,
  };

  it('arma el artículo completo', () => {
    const post = blogPostingSchema({
      ...base,
      description: 'Resumen',
      authorName: 'Ana',
      image: `${ORIGIN}/c.jpg`,
    });
    expect(post).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Título',
      datePublished: '2026-11-01',
      author: { '@type': 'Organization', name: 'Ana' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${ORIGIN}/blog/titulo` },
      image: `${ORIGIN}/c.jpg`,
    });
  });

  it('sin portada ni descripción no genera esos campos; el autor cae en la organización', () => {
    const post = blogPostingSchema({ ...base, description: '', authorName: '' });
    expect(post).not.toHaveProperty('image');
    expect(post).not.toHaveProperty('description');
    expect(post.author).toEqual({ '@type': 'Organization', name: 'Arena IT' });
  });
});

describe('breadcrumbSchema', () => {
  it('numera desde 1', () => {
    const bc = breadcrumbSchema([
      { name: 'Inicio', url: `${ORIGIN}/` },
      { name: 'Blog', url: `${ORIGIN}/blog` },
    ]);
    expect(bc['@type']).toBe('BreadcrumbList');
    expect(bc.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${ORIGIN}/blog` },
    ]);
  });
});

describe('listas', () => {
  it('servicios, FAQ y colección', () => {
    const services = serviceListSchema(
      [{ name: 'Bizagi', description: '', url: `${ORIGIN}/servicios#bizagi` }],
      { name: 'Arena IT', url: ORIGIN },
    );
    const first = (services.itemListElement as { item: Record<string, unknown> }[])[0].item;
    expect(first['@type']).toBe('Service');
    expect(first).not.toHaveProperty('description');

    expect(faqPageSchema([{ question: '¿Q?', answer: 'A' }])['@type']).toBe('FAQPage');

    const col = collectionPageSchema({ name: 'P', url: `${ORIGIN}/proyectos`, itemNames: ['A'] });
    expect(col['@type']).toBe('CollectionPage');
  });
});

describe('contenido prohibido', () => {
  it('ningún constructor emite ratings, premios, certificaciones, partner ni precios', () => {
    const all = [
      organizationSchema({ name: 'Arena IT', url: ORIGIN, foundingDate: '2013' }),
      webSiteSchema({ name: 'Arena IT', url: ORIGIN }),
      blogPostingSchema({
        headline: 'x',
        datePublished: '2026-01-01',
        publisherName: 'Arena IT',
        publisherUrl: ORIGIN,
        url: ORIGIN,
      }),
      breadcrumbSchema([{ name: 'Inicio', url: ORIGIN }]),
      serviceListSchema([{ name: 'S', url: ORIGIN }], { name: 'Arena IT', url: ORIGIN }),
      faqPageSchema([{ question: 'q', answer: 'a' }]),
      collectionPageSchema({ name: 'c', url: ORIGIN, itemNames: ['a'] }),
    ];
    for (const schema of all) {
      const text = JSON.stringify(schema);
      expect(text).not.toMatch(FORBIDDEN);
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('null');
      expect(text).not.toContain('""');
    }
  });
});
