import { expect, test } from 'vitest'
import { sanityEnv } from '../src/lib/sanity'

test('lee la configuración del .env de Astro (modo desarrollo)', () => {
  expect(sanityEnv({ SANITY_PROJECT_ID: 'abc' }, {})).toEqual({ projectId: 'abc', dataset: 'production' })
})

test('lee la configuración del entorno del sistema (Cloudflare)', () => {
  expect(sanityEnv({}, { SANITY_PROJECT_ID: 'xyz', SANITY_DATASET: 'staging' })).toEqual({
    projectId: 'xyz',
    dataset: 'staging',
  })
})

test('sin identificador de proyecto da un error claro', () => {
  expect(() => sanityEnv({}, {})).toThrow(/SANITY_PROJECT_ID/)
})
