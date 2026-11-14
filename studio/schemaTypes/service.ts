import {defineField, defineType} from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Servicio',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'localeString',
      description: 'Por ejemplo: "Vídeos UGC" o "Guiones de vídeo".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción breve',
      type: 'localeText',
      description: 'Opcional. Una frase. No pongas tarifas.',
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Opcional. Número más bajo, más arriba.',
    }),
  ],
  orderings: [{title: 'Orden manual', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name.es'}},
})
