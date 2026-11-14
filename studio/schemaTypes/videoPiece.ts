import {defineField, defineType} from 'sanity'

export const videoPiece = defineType({
  name: 'videoPiece',
  title: 'Vídeo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'localeString',
      description: 'Título corto que se ve bajo el vídeo. Por ejemplo: "Review de crema hidratante".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Tipo de vídeo',
      type: 'reference',
      to: [{type: 'videoCategory'}],
      description: 'Sirve para los filtros de la web. Si el tipo no existe, créalo desde aquí mismo.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Marca',
      type: 'reference',
      to: [{type: 'brand'}],
      description: 'Opcional. Déjalo vacío si es un vídeo personal.',
    }),
    defineField({
      name: 'video',
      title: 'Archivo de vídeo',
      type: 'file',
      options: {accept: 'video/mp4'},
      description:
        'Archivo MP4 vertical de menos de 100 MB. Antes de subirlo, comprímelo con la guía.',
      validation: (rule) => rule.required().error('Falta el archivo de vídeo.'),
    }),
    defineField({
      name: 'poster',
      title: 'Imagen de portada',
      type: 'image',
      options: {hotspot: true},
      description:
        'Opcional. Imagen vertical que se ve antes de reproducir. Si no pones ninguna, se usa el primer instante del vídeo.',
    }),
    defineField({
      name: 'description',
      title: 'Descripción breve',
      type: 'localeText',
      description: 'Opcional. Una o dos frases sobre el vídeo.',
    }),
    defineField({
      name: 'featured',
      title: 'Destacado',
      type: 'boolean',
      description: 'Los vídeos destacados aparecen primero.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Opcional. Número más bajo, más arriba. Sin número, va al final.',
    }),
  ],
  orderings: [{title: 'Orden manual', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title.es', subtitle: 'category.title.es', media: 'poster'},
  },
})
