import { expect, test } from 'vitest'
import type { Locale } from '../src/lib/i18n'
import rawJson from '../src/lib/fixtures/site.raw.json'
import { getSiteData, toSiteData } from '../src/lib/site-data'
import type { RawSite } from '../src/lib/types'

const raw = rawJson as RawSite
const d = (l: Locale = 'es') => toSiteData(raw, l)
const empty: RawSite = { settings: null, categories: [], videos: [], actingWorks: [], brands: [], services: [] }

test('los destacados van primero y el resto por orden', () => {
  expect(d().videos.map((v) => v.id)).toEqual(['destacado', 'sin-en', 'sin-poster', 'titulo-largo'])
})

test('las categorías sin vídeos no aparecen', () => {
  expect(d().categories.map((c) => c.slug)).toEqual(['review', 'unboxing'])
})

test('los textos salen en el idioma pedido', () => {
  expect(d('en').tagline).toBe('Actress & UGC creator')
  expect(d('es').tagline).toBe('Actriz y creadora de contenido UGC')
  expect(d('en').categories[0].title).toBe('Review')
})

test('título sin inglés cae al español', () => {
  const title = (l: Locale) => d(l).videos.find((v) => v.id === 'sin-en')!.title
  expect(title('en')).toBe('Vídeo de prueba solo en español')
  expect(d('en').marqueeWords).toContain('Unboxing')
})

test('vídeo sin portada conserva videoUrl y deja posterUrl sin definir', () => {
  const v = d().videos.find((v) => v.id === 'sin-poster')!
  expect(v.posterUrl).toBeUndefined()
  expect(v.videoUrl).toMatch(/^https:/)
})

test('trabajos de actriz por año descendente', () => {
  expect(d().actingWorks.map((a) => a.year)).toEqual([2024, 2019])
})

test('servicios por orden', () => {
  expect(d().services.map((s) => s.name)).toEqual(['Servicio de prueba uno', 'Servicio de prueba dos'])
})

test('las fotos llevan dimensiones y texto alternativo', () => {
  expect(d().heroPhotos).toHaveLength(2)
  expect(d().heroPhotos[0]).toMatchObject({ width: 1200, height: 1500, alt: 'Jimena Melendez' })
  expect(d().actingWorks[1].photos[0].alt).toBe('Obra de prueba antigua')
})

test('contenido vacío no rompe', () => {
  const e = toSiteData(empty, 'es')
  expect(e.videos).toEqual([])
  expect(e.categories).toEqual([])
  expect(e.heroPhotos).toEqual([])
  expect(e.heroVideoUrl).toBeUndefined()
  expect(e.marqueeWords).toEqual([])
  expect(e.showBrands).toBe(false)
  expect(e.showCasting).toBe(false)
  expect(e.email).toBe('')
  expect(e.tagline).toBe('')
})

test('listas que llegan como null no rompen', () => {
  const e = toSiteData(
    { settings: { heroPhotos: null, marqueeWords: null, languages: null }, categories: null, videos: null, actingWorks: null, brands: null, services: null } as unknown as RawSite,
    'en',
  )
  expect(e.videos).toEqual([])
  expect(e.languages).toEqual([])
})

test('vídeos sin archivo se descartan', () => {
  const data = toSiteData({ ...empty, videos: [{ _id: 'x', title: { es: 'x' } }] }, 'es')
  expect(data.videos).toEqual([])
})

test('fotos sin archivo se descartan', () => {
  const data = toSiteData({ ...empty, settings: { heroPhotos: [{ url: null }, null] } } as unknown as RawSite, 'es')
  expect(data.heroPhotos).toEqual([])
})

test('getSiteData propaga el error de Sanity con un mensaje claro', async () => {
  const quota = Object.assign(new Error('plan_limit_reached'), { statusCode: 402 })
  await expect(getSiteData('es', () => Promise.reject(quota))).rejects.toThrow(
    /No se pudo leer el contenido de Sanity: plan_limit_reached/,
  )
})

test('getSiteData falla si Sanity devuelve una respuesta sin forma', async () => {
  await expect(getSiteData('es', () => Promise.resolve(null as unknown as RawSite))).rejects.toThrow(
    /No se pudo leer el contenido de Sanity/,
  )
})

test('getSiteData convierte lo que devuelve la fuente', async () => {
  const data = await getSiteData('en', () => Promise.resolve(raw))
  expect(data.locale).toBe('en')
  expect(data.videos).toHaveLength(4)
})
