import { SECTORS } from './options';
import { stringField, textField } from './helpers';

/** Ajustes generales del sitio (documento único). */
export const siteSettingsSchema = {
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  fields: [
    stringField('siteName', 'Nombre de la marca', {
      description: 'Siempre «Arena IT», con espacio.',
    }),
    stringField('tagline', 'Lema del pie de página'),
    textField('defaultDescription', 'Descripción por defecto para buscadores'),
    stringField('whatsappNumber', 'WhatsApp: número', {
      description: 'Con indicativo del país y sin signos ni espacios (573001234567).',
    }),
    stringField('whatsappMessage', 'WhatsApp: mensaje prellenado'),
    stringField('managerName', 'Contacto: nombre del gerente'),
    stringField('managerRole', 'Contacto: cargo'),
    {
      name: 'sectors',
      title: 'Sectores',
      type: 'array',
      description:
        'Alimentan los filtros de Proyectos, las cuadrículas de sectores y el bloque «Dónde hemos trabajado». La clave no se cambia.',
      validation: (Rule: any) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'key',
              title: 'Clave',
              type: 'string',
              options: { list: SECTORS, layout: 'dropdown' },
              validation: (Rule: any) => Rule.required(),
            },
            stringField('label', 'Etiqueta corta (filtros y tarjetas)'),
            {
              name: 'gridLabel',
              title: 'Etiqueta en cuadrículas',
              type: 'string',
              description: 'Opcional. Por ejemplo «Sector público» cuando la etiqueta corta es «Público».',
            },
            textField('description', 'Qué hemos hecho en el sector', {}, 2),
          ],
          preview: { select: { title: 'label', subtitle: 'description' } },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Ajustes del sitio' }) },
};
