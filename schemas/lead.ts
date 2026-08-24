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
      name: 'company',
      title: 'Empresa',
      type: 'string',
    },
    {
      name: 'corporateEmail',
      title: 'Correo',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'phone',
      title: 'Teléfono',
      type: 'string',
    },
    {
      name: 'serviceOfInterest',
      title: 'Servicio de Interés',
      type: 'string',
    },
    {
      name: 'message',
      title: 'Mensaje',
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
