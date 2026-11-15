import {esESLocale} from '@sanity/locale-es-es'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'
import {SINGLETON_TYPES, singletonActions, structure} from './structure'

// El identificador del proyecto no es secreto, pero se lee del entorno para
// que el repositorio funcione con cualquier proyecto de Sanity.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? ''
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

export default defineConfig({
  name: 'default',
  title: 'Portafolio de Jimena',
  projectId,
  dataset,
  plugins: [structureTool({structure}), esESLocale()],
  schema: {
    types: schemaTypes,
    // La ficha única no aparece en el menú "Crear".
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    // La ficha única no se puede despublicar, duplicar ni borrar.
    actions: (actions, {schemaType}) => singletonActions(actions, schemaType),
  },
})
