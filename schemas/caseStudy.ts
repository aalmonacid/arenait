export const caseStudySchema = {
  name: 'caseStudy',
  title: 'Case Study',
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'client',
      title: 'Client',
      type: 'string',
    },
    {
      name: 'industry',
      title: 'Industry',
      type: 'string',
    },
    {
      name: 'challenge',
      title: 'Challenge',
      type: 'text',
    },
    {
      name: 'solution',
      title: 'Solution',
      type: 'text',
    },
    {
      name: 'results',
      title: 'Results',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'screenshots',
      title: 'Capturas reales del producto',
      description:
        'Capturas de pantalla reales de la plataforma construida para este cliente (no renders ni mockups). Sin esto, la página muestra un aviso de que las capturas están pendientes de recibir.',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
  ],
};
