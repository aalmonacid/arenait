import type { Rule as SanityRule } from 'sanity';
export const whitepaperSchema = {
  name: 'whitepaper',
  title: 'Whitepaper (Lead Magnet)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'Resumen ejecutivo',
    },
    {
      name: 'pdfFile',
      title: 'PDF File',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      description: 'Archivo PDF de la guía/arquitectura',
    },
    {
      name: 'targetRole',
      title: 'Target Role',
      type: 'string',
      options: {
        list: [
          { title: 'C-Level', value: 'c-level' },
          { title: 'VP Engineering', value: 'vp-engineering' },
          { title: 'Enterprise Architect', value: 'enterprise-architect' },
        ],
      },
    },
  ],
};
