export const testimonialSchema = {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    {
      name: 'authorName',
      title: 'Nombre del autor',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
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
      validation: (Rule: any) => Rule.required(),
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
