import {defineField, defineType} from 'sanity'

export const localeString = defineType({
  name: 'localeString',
  title: 'Texto en dos idiomas',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Español',
      type: 'string',
      validation: (rule) => rule.required().error('El texto en español es obligatorio.'),
    }),
    defineField({
      name: 'en',
      title: 'Inglés',
      type: 'string',
      description: 'Si lo dejas vacío, en la versión en inglés se verá el texto en español.',
    }),
  ],
})
