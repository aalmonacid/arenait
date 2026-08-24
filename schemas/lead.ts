export const leadSchema = {
  name: 'lead',
  title: 'Lead',
  type: 'document',
  fields: [
    {
      name: 'fullName',
      title: 'Nombre Completo',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'jobTitle',
      title: 'Cargo',
      type: 'string',
    },
    {
      name: 'corporateEmail',
      title: 'Correo Corporativo',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'infrastructure',
      title: 'Infraestructura Actual',
      type: 'string',
    },
    {
      name: 'message',
      title: 'Mensaje / Reto Técnico',
      type: 'text',
    },
    {
      name: 'source',
      title: 'Origen',
      type: 'string',
      description: 'Formulario o sección del sitio que generó el lead',
    },
    {
      name: 'createdAt',
      title: 'Fecha de Captura',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'corporateEmail',
    },
  },
};
