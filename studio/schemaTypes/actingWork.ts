import {defineField, defineType} from 'sanity'

export const actingWork = defineType({
  name: 'actingWork',
  title: 'Trabajo como actriz',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      description: 'Nombre de la obra, el cortometraje o el taller.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          {title: 'Teatro', value: 'teatro'},
          {title: 'Cortometraje', value: 'cortometraje'},
          {title: 'Taller', value: 'taller'},
          {title: 'Otro', value: 'otro'},
        ],
        layout: 'radio',
      },
      initialValue: 'teatro',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Personaje',
      type: 'string',
      description: 'Opcional. El papel que interpretaste.',
    }),
    defineField({
      name: 'year',
      title: 'Año',
      type: 'number',
      description: 'Opcional. Los trabajos se ordenan del más reciente al más antiguo.',
      validation: (rule) => rule.integer().min(1990).max(2100),
    }),
    defineField({
      name: 'company',
      title: 'Compañía o dirección',
      type: 'string',
      description: 'Opcional. Compañía, director o directora, o escuela.',
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'localeText',
      description: 'Opcional. Una o dos frases.',
    }),
    defineField({
      name: 'photos',
      title: 'Fotos',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true, storeOriginalFilename: false}}],
      description: 'Opcional. Fotos de escena o del rodaje.',
    }),
    defineField({
      name: 'video',
      title: 'Vídeo',
      type: 'file',
      options: {accept: 'video/mp4', storeOriginalFilename: false},
      description: 'Opcional. Archivo MP4 de menos de 100 MB, comprimido con la guía.',
    }),
  ],
  orderings: [
    {title: 'Año, reciente primero', name: 'yearDesc', by: [{field: 'year', direction: 'desc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'role', media: 'photos.0'}},
})
