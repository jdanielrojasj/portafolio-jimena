import {defineField, defineType} from 'sanity'

export const brand = defineType({
  name: 'brand',
  title: 'Marca',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Opcional. Si no hay logo, en la web se muestra el nombre.',
    }),
  ],
  preview: {select: {title: 'name', media: 'logo'}},
})
