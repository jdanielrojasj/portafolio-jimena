import {defineField, defineType} from 'sanity'

export const videoCategory = defineType({
  name: 'videoCategory',
  title: 'Tipo de vídeo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'localeString',
      description: 'Por ejemplo: Review, Unboxing, Testimonial, Beauty, Personal.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador',
      type: 'slug',
      description: 'Pulsa "Generar". Es un nombre interno para los filtros; no hace falta cambiarlo.',
      options: {source: 'title.es', maxLength: 40},
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'title.es'}},
})
