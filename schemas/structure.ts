import type { StructureResolver } from 'sanity/structure';
import { SINGLETONS } from './index';

/**
 * Estructura del Studio: los documentos únicos (ajustes y páginas) fijos arriba,
 * luego las colecciones. Cada documento único se abre directamente por su `_id`
 * (igual al nombre del tipo), sin lista intermedia.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      ...SINGLETONS.map(({ type, title }) =>
        S.listItem()
          .id(type)
          .title(title)
          .child(S.document().schemaType(type).documentId(type).title(title)),
      ),
      S.divider(),
      S.documentTypeListItem('service').title('Servicios'),
      S.documentTypeListItem('project').title('Proyectos'),
      S.documentTypeListItem('post').title('Blog'),
      S.documentTypeListItem('privacyPolicy').title('Política de datos'),
      S.documentTypeListItem('testimonial').title('Testimonios'),
      S.documentTypeListItem('lead').title('Contactos (lead)'),
      S.documentTypeListItem('whitepaper').title('Whitepapers'),
    ]);
