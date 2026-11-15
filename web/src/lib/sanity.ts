import { createClient } from '@sanity/client'
import { SITE_QUERY } from './queries'
import type { RawSite } from './types'

type Env = Record<string, string | undefined>

/**
 * Configuración de Sanity. En desarrollo Astro solo expone el archivo .env
 * en import.meta.env; al construir en Cloudflare llega por process.env.
 */
export function sanityEnv(metaEnv: Env, procEnv: Env) {
  const projectId = metaEnv.SANITY_PROJECT_ID || procEnv.SANITY_PROJECT_ID
  if (!projectId) throw new Error('falta la variable de entorno SANITY_PROJECT_ID')
  return { projectId, dataset: metaEnv.SANITY_DATASET || procEnv.SANITY_DATASET || 'production' }
}

/**
 * Lee todo el contenido publicado desde Sanity. Solo se ejecuta al
 * construir la web, nunca en el navegador de quien la visita.
 */
export async function fetchRawFromSanity(): Promise<RawSite> {
  const { projectId, dataset } = sanityEnv(import.meta.env as Env, process.env)

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-02-19',
    // Sin caché: cada construcción debe ver lo último que se publicó.
    useCdn: false,
    perspective: 'published',
  })
  return client.fetch<RawSite>(SITE_QUERY)
}
