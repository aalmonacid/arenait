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
    {
      name: 'policyAccepted',
      title: 'Aceptó la Política de Tratamiento de Datos',
      type: 'boolean',
      description: 'Evidencia de consentimiento exigida por la Ley 1581 de 2012.',
    },
    {
      name: 'policyVersion',
      title: 'Versión de la política aceptada',
      type: 'string',
    },
    {
      name: 'policyAcceptedAt',
      title: 'Fecha de aceptación de la política',
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
