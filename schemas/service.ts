export const serviceSchema = {
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Nombre del ícono del set del tablero de marca',
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'string',
      description: 'Una línea de descripción, usada en la card de home',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Descripción completa, usada en la página de Servicios',
      validation: (Rule: any) => Rule.required(),
    },
  ],
};
