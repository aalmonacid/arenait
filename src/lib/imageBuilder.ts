import { sanityClient } from 'sanity:client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';

const builder = imageUrlBuilder(sanityClient);

/**
 * Utilidad optimizada para resolver URLs de imágenes de Sanity
 * Formato auto (generalmente webp/avif) para alto performance.
 */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max');
}
