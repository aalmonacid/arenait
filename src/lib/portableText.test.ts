import { describe, expect, it } from 'vitest';
import { portableTextToHtml, imageDimensions } from './portableText';
import { isSafeHref } from './safeHref';
import type { PortableTextContent } from '../types/sanity';

const imageUrl = (_image: unknown, width: number) =>
  `https://cdn.sanity.io/images/x/production/img.jpg?w=${width}`;
const render = (value: PortableTextContent) => portableTextToHtml(value, { imageUrl });

const block = (text: string, extra: Record<string, unknown> = {}) =>
  ({
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text, marks: [] }],
    ...extra,
  }) as PortableTextContent[number];

const linkBlock = (href: string, text = 'aquí') =>
  ({
    _type: 'block',
    style: 'normal',
    markDefs: [{ _key: 'l1', _type: 'link', href }],
    children: [{ _type: 'span', text, marks: ['l1'] }],
  }) as PortableTextContent[number];

describe('portableTextToHtml: estructura admitida', () => {
  it('convierte párrafos, títulos, negrita, cursiva y listas', () => {
    const html = render([
      block('Título', { style: 'h2' }),
      block('Subtítulo', { style: 'h3' }),
      {
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          { _type: 'span', text: 'Hola ', marks: [] },
          { _type: 'span', text: 'fuerte', marks: ['strong'] },
          { _type: 'span', text: ' y ', marks: [] },
          { _type: 'span', text: 'suave', marks: ['em'] },
        ],
      },
      block('uno', { listItem: 'bullet', level: 1 }),
      block('dos', { listItem: 'bullet', level: 1 }),
      block('primero', { listItem: 'number', level: 1 }),
      block('cita', { style: 'blockquote' }),
    ]);
    expect(html).toContain('<h2>Título</h2>');
    expect(html).toContain('<h3>Subtítulo</h3>');
    expect(html).toContain('<p>Hola <strong>fuerte</strong> y <em>suave</em></p>');
    expect(html).toContain('<ul><li>uno</li><li>dos</li></ul>');
    expect(html).toContain('<ol><li>primero</li></ol>');
    expect(html).toContain('<blockquote>cita</blockquote>');
  });

  it('devuelve texto vacío si no hay contenido', () => {
    expect(render([])).toBe('');
    expect(portableTextToHtml(undefined, { imageUrl })).toBe('');
  });

  it('nunca emite style="" ni scripts (CSP estricta), ni con subrayado o tipos desconocidos', () => {
    const html = render([
      {
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', text: 'subrayado', marks: ['underline', 'inventada'] }],
      },
      { _type: 'tablaRara', filas: 3 } as never,
      block('h4 no admitido', { style: 'h4' }),
    ]);
    expect(html).not.toMatch(/style=|<script|display:none/i);
    expect(html).toContain('subrayado');
    expect(html).toContain('<p>h4 no admitido</p>');
  });
});

describe('portableTextToHtml: escape de HTML', () => {
  it('escapa el texto (no deja pasar etiquetas)', () => {
    const html = render([block('<script>alert(1)</script> & <img src=x onerror=alert(1)>')]);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &lt;img');
  });

  it('escapa también el texto de los enlaces y el atributo href', () => {
    const html = render([linkBlock('https://ejemplo.co/?a="x"&b=<y>', '<b>hola</b>')]);
    expect(html).toContain('&lt;b&gt;hola&lt;/b&gt;');
    expect(html).toContain('href="https://ejemplo.co/?a=&quot;x&quot;&amp;b=&lt;y&gt;"');
    expect(html).not.toContain('"x"');
  });
});

describe('portableTextToHtml: enlaces', () => {
  it('admite http(s), mailto, rutas internas y anclas', () => {
    expect(render([linkBlock('https://arenait.co/x')])).toContain(
      '<a href="https://arenait.co/x" rel="noopener noreferrer">aquí</a>',
    );
    expect(render([linkBlock('http://ejemplo.co')])).toContain('rel="noopener noreferrer"');
    expect(render([linkBlock('mailto:hola@ejemplo.co')])).toContain(
      '<a href="mailto:hola@ejemplo.co">aquí</a>',
    );
    expect(render([linkBlock('/contacto')])).toContain('<a href="/contacto">aquí</a>');
    expect(render([linkBlock('#cookies')])).toContain('<a href="#cookies">aquí</a>');
  });

  it('descarta javascript:, data:, vbscript: y otros esquemas, dejando solo el texto', () => {
    for (const href of [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      ' javascript:alert(1)',
      'java\nscript:alert(1)',
      'data:text/html;base64,PHNjcmlwdD4=',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'ftp://ejemplo.co',
      '//evil.example',
      '/\\evil.example',
      'sinesquema',
      '',
    ]) {
      const html = render([linkBlock(href, 'texto')]);
      expect(html, href).not.toContain('<a');
      expect(html, href).toBe('<p>texto</p>');
    }
  });

  it('isSafeHref aplica la misma regla', () => {
    expect(isSafeHref('/contacto')).toBe(true);
    expect(isSafeHref('https://arenait.co')).toBe(true);
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref(undefined)).toBe(false);
  });
});

describe('portableTextToHtml: imágenes', () => {
  const image = (extra: Record<string, unknown> = {}) =>
    ({
      _type: 'image',
      alt: 'Diagrama de la arquitectura',
      asset: { _ref: 'image-abc123-2000x1000-jpg' },
      ...extra,
    }) as PortableTextContent[number];

  it('renderiza con alt, tamaño proporcional, lazy y async', () => {
    const html = render([image({ caption: 'Fuente: <propia>' })]);
    expect(html).toContain('alt="Diagrama de la arquitectura"');
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="600"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('src="https://cdn.sanity.io/images/x/production/img.jpg?w=1200"');
    expect(html).toContain('<figcaption>Fuente: &lt;propia&gt;</figcaption>');
  });

  it('no renderiza una imagen sin alt (o con alt en blanco)', () => {
    expect(render([image({ alt: undefined })])).toBe('');
    expect(render([image({ alt: '   ' })])).toBe('');
  });

  it('no renderiza una imagen sin referencia de archivo válida', () => {
    expect(render([image({ asset: undefined })])).toBe('');
    expect(render([image({ asset: { _ref: 'file-abc-pdf' } })])).toBe('');
  });

  it('imageDimensions lee ancho y alto de la referencia', () => {
    expect(imageDimensions('image-abc123-640x480-png')).toEqual({ width: 640, height: 480 });
    expect(imageDimensions('basura')).toBeUndefined();
  });
});
