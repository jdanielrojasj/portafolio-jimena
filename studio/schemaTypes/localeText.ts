import {defineField, defineType} from 'sanity'

export const localeText = defineType({
  name: 'localeText',
  title: 'Párrafo en dos idiomas',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Español',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().error('El texto en español es obligatorio.'),
    }),
    defineField({
      name: 'en',
      title: 'Inglés',
      type: 'text',
      rows: 4,
      description: 'Si lo dejas vacío, en la versión en inglés se verá el texto en español.',
    }),
  ],
})
