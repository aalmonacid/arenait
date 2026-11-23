import type { Rule as SanityRule } from 'sanity';
export const testimonialSchema = {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    {
      name: 'authorName',
      title: 'Nombre del autor',
      type: 'string',
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Cargo',
      type: 'string',
    },
    {
      name: 'company',
      title: 'Empresa',
      type: 'string',
    },
    {
      name: 'quote',
      title: 'Testimonio',
      type: 'text',
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'photo',
      title: 'Foto',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'company',
      media: 'photo',
    },
  },
};
