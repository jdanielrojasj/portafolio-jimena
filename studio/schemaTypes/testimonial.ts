import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Opinión',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Texto de la opinión',
      type: 'text',
      rows: 5,
      description:
        'Copia el texto exacto, tal como lo escribió la persona y en su idioma original. No lo traduzcas ni lo resumas.',
      validation: (rule) => rule.required().error('Falta el texto de la opinión.'),
    }),
    defineField({
      name: 'quoteLang',
      title: 'Idioma del texto',
      type: 'string',
      description: 'El idioma en que está escrita la opinión. Se muestra igual en la versión en español y en inglés.',
      options: {
        list: [
          {title: 'Inglés', value: 'en'},
          {title: 'Español', value: 'es'},
          {title: 'Portugués', value: 'pt'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'en',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Quién la escribió',
      type: 'string',
      description:
        'Opcional. Nombre de la persona. Si no lo sabes (Upwork no lo muestra), déjalo vacío y se verá "Cliente en Upwork".',
    }),
    defineField({
      name: 'role',
      title: 'Cargo o empresa',
      type: 'localeString',
      description: 'Opcional. Por ejemplo: "Directora de marketing, Marca X".',
    }),
    defineField({
      name: 'project',
      title: 'Trabajo',
      type: 'localeString',
      description: 'Opcional. En qué trabajasteis juntos. Por ejemplo: "Vídeos testimoniales UGC".',
    }),
    defineField({
      name: 'rating',
      title: 'Valoración',
      type: 'number',
      description: 'Opcional. Estrellas sobre 5, por ejemplo 4,8. Déjalo vacío si no hubo puntuación.',
      validation: (rule) => rule.min(0.5).max(5).precision(1),
    }),
    defineField({
      name: 'source',
      title: 'Dónde se publicó',
      type: 'string',
      description: 'De dónde sale la opinión.',
      options: {
        list: [
          {title: 'Upwork', value: 'upwork'},
          {title: 'LinkedIn', value: 'linkedin'},
          {title: 'Me la dieron directamente', value: 'directo'},
        ],
        layout: 'radio',
      },
      initialValue: 'upwork',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Enlace',
      type: 'url',
      description: 'Opcional. Dirección donde se puede leer la opinión, por ejemplo tu perfil de Upwork.',
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Opcional. Número más bajo, más arriba. Sin número, van al final.',
    }),
  ],
  orderings: [{title: 'Orden manual', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'quote', subtitle: 'author'}},
})
