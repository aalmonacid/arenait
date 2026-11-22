/**
 * Texto enriquecido de Sanity → HTML con las imágenes resueltas por el CDN de
 * Sanity. Aparte de `portableText.ts` para poder probar la conversión sin el
 * módulo virtual `sanity:client`.
 */
import { portableTextToHtml } from './portableText';
import { urlForImage } from './imageBuilder';
import type { PortableTextContent } from '../types/sanity';

export const renderBody = (value: PortableTextContent | null | undefined): string =>
  portableTextToHtml(value, {
    imageUrl: (image, width) => urlForImage(image).width(width).url(),
  });
