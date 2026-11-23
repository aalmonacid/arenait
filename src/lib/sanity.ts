import { sanityClient } from 'sanity:client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';

export const client = sanityClient;

const builder = imageUrlBuilder(client);

/**
 * Utilidad para resolver las URLs de las imágenes almacenadas en Sanity.io
 * @param source Objeto de imagen de Sanity
 * @returns URL Builder
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
