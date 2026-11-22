/**
 * Convierte el texto enriquecido de Sanity (Portable Text) a HTML para insertarlo
 * con `set:html`. No hay HTML libre: solo párrafos, títulos h2/h3, citas, listas,
 * negrita, cursiva, enlaces e imágenes. El texto se escapa; la CSP del sitio
 * prohíbe `style=""` y scripts en línea, así que ningún componente los emite.
 *
 * - Enlaces: solo `http(s):`, `mailto:`, rutas internas (`/`) y anclas (`#`); si
 *   el enlace no es válido se muestra solo el texto. Los externos llevan
 *   `rel="noopener noreferrer"`.
 * - Imágenes: requieren `alt` y un `asset` válido; si falta alguno, no se
 *   muestran. La URL la resuelve `imageUrl` (inyectada, ver `renderBody.ts`).
 */
import { escapeHTML, toHTML, type PortableTextComponents } from '@portabletext/to-html';
import { isExternalHref, isSafeHref } from './safeHref';
import type { PortableTextContent, PortableTextImage } from '../types/sanity';

export interface PortableTextOptions {
  /** Devuelve la URL de la imagen con el ancho pedido (px), o undefined si no se puede. */
  imageUrl: (image: PortableTextImage, width: number) => string | undefined;
}

/** Ancho máximo de las imágenes del cuerpo (la columna de lectura mide 768 px). */
const MAX_IMAGE_WIDTH = 1200;

const attr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Las referencias de imagen de Sanity son `image-<id>-<ancho>x<alto>-<ext>`. */
export function imageDimensions(ref: unknown): { width: number; height: number } | undefined {
  if (typeof ref !== 'string') return undefined;
  const match = /^image-[A-Za-z0-9]+-(\d+)x(\d+)-[a-z0-9]+$/.exec(ref);
  if (!match) return undefined;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? { width, height } : undefined;
}

const paragraph = ({ children }: { children?: string }) => `<p>${children ?? ''}</p>`;

export function portableTextToHtml(
  value: PortableTextContent | null | undefined,
  options: PortableTextOptions,
): string {
  if (!Array.isArray(value) || value.length === 0) return '';

  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => (children && children.trim() ? `<p>${children}</p>` : ''),
      h1: paragraph,
      h2: ({ children }) => `<h2>${children ?? ''}</h2>`,
      h3: ({ children }) => `<h3>${children ?? ''}</h3>`,
      h4: paragraph,
      h5: paragraph,
      h6: paragraph,
      blockquote: ({ children }) => `<blockquote>${children ?? ''}</blockquote>`,
    },
    marks: {
      // El subrayado por defecto usa style="": no lo emitimos.
      underline: ({ children }) => children,
      link: ({ value: mark, children }) => {
        const href = (mark as { href?: unknown } | undefined)?.href;
        if (!isSafeHref(href)) return children;
        const url = href.trim();
        const rel = isExternalHref(url) ? ' rel="noopener noreferrer"' : '';
        return `<a href="${attr(url)}"${rel}>${children}</a>`;
      },
    },
    unknownMark: ({ children }) => children,
    unknownType: () => '',
    unknownBlockStyle: paragraph,
    types: {
      image: ({ value: image }) => {
        const img = image as PortableTextImage;
        const alt = typeof img.alt === 'string' ? img.alt.trim() : '';
        const size = imageDimensions(img.asset?._ref);
        if (!alt || !size) return '';
        const width = Math.min(size.width, MAX_IMAGE_WIDTH);
        const height = Math.round((size.height * width) / size.width);
        const src = options.imageUrl(img, width);
        if (!src) return '';
        const caption = img.caption?.trim()
          ? `<figcaption>${escapeHTML(img.caption.trim())}</figcaption>`
          : '';
        return (
          `<figure><img src="${attr(src)}" alt="${attr(alt)}" width="${width}" height="${height}" ` +
          `loading="lazy" decoding="async" />${caption}</figure>`
        );
      },
    },
  };

  return toHTML(value, { components, onMissingComponent: false });
}
