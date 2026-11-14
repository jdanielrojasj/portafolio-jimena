import { createClient } from '@sanity/client'
import { SITE_QUERY } from './queries'
import type { RawSite } from './types'

/**
 * Lee todo el contenido publicado desde Sanity. Solo se ejecuta al
 * construir la web, nunca en el navegador de quien la visita.
 */
export async function fetchRawFromSanity(): Promise<RawSite> {
  const projectId = process.env.SANITY_PROJECT_ID
  if (!projectId) throw new Error('falta la variable de entorno SANITY_PROJECT_ID')

  const client = createClient({
    projectId,
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2025-02-19',
    // Sin caché: cada construcción debe ver lo último que se publicó.
    useCdn: false,
    perspective: 'published',
  })
  return client.fetch<RawSite>(SITE_QUERY)
}
