/**
 * Contacto recibido desde el formulario del sitio. Se organiza en secciones
 * compactas (varias columnas) para verlo completo sin bajar el zoom del Studio.
 * Los datos de captura son evidencia: se muestran como solo lectura.
 */
export const leadSchema = {
  name: 'lead',
  title: 'Contacto recibido',
  type: 'document',
  fieldsets: [
    { name: 'contact', title: 'Datos de contacto', options: { columns: 2 } },
    { name: 'request', title: 'Solicitud' },
    { name: 'consent', title: 'Consentimiento (Ley 1581)', options: { columns: 3 } },
    {
      name: 'meta',
      title: 'Datos técnicos',
      options: { collapsible: true, collapsed: true, columns: 2 },
    },
  ],
  fields: [
    {
      name: 'fullName',
      title: 'Nombre completo',
      type: 'string',
      fieldset: 'contact',
      readOnly: true,
    },
    { name: 'company', title: 'Empresa', type: 'string', fieldset: 'contact', readOnly: true },
    {
      name: 'corporateEmail',
      title: 'Correo',
      type: 'string',
      fieldset: 'contact',
      readOnly: true,
    },
    { name: 'phone', title: 'Teléfono', type: 'string', fieldset: 'contact', readOnly: true },
    {
      name: 'serviceOfInterest',
      title: 'Servicio de interés',
      type: 'string',
      fieldset: 'request',
      readOnly: true,
    },
    {
      name: 'message',
      title: 'Mensaje',
      type: 'text',
      rows: 5,
      fieldset: 'request',
      readOnly: true,
    },
    {
      name: 'policyAccepted',
      title: 'Aceptó la política',
      type: 'boolean',
      description: 'Evidencia de consentimiento (Ley 1581 de 2012).',
      fieldset: 'consent',
      readOnly: true,
    },
    {
      name: 'policyVersion',
      title: 'Versión de la política',
      type: 'string',
      fieldset: 'consent',
      readOnly: true,
    },
    {
      name: 'policyAcceptedAt',
      title: 'Fecha de aceptación',
      type: 'datetime',
      fieldset: 'consent',
      readOnly: true,
    },
    {
      name: 'source',
      title: 'Origen',
      type: 'string',
      description: 'Formulario o sección del sitio que generó el contacto.',
      fieldset: 'meta',
      readOnly: true,
    },
    {
      name: 'createdAt',
      title: 'Fecha de captura',
      type: 'datetime',
      fieldset: 'meta',
      readOnly: true,
    },
  ],
  orderings: [
    {
      title: 'Más recientes primero',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Nombre (A-Z)',
      name: 'fullNameAsc',
      by: [{ field: 'fullName', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'fullName',
      company: 'company',
      service: 'serviceOfInterest',
      email: 'corporateEmail',
    },
    prepare({
      title,
      company,
      service,
      email,
    }: {
      title?: string;
      company?: string;
      service?: string;
      email?: string;
    }) {
      const detail = [company, service].filter(Boolean).join(' · ');
      return { title: title ?? 'Sin nombre', subtitle: detail || email };
    },
  },
};
