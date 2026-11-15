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

// ---------- Revisión final ----------

test('getSiteData falla si los ajustes de la web no están publicados', async () => {
  await expect(getSiteData('es', () => Promise.resolve(empty))).rejects.toThrow(
    /No se pudo leer el contenido de Sanity: .*Ajustes de la web/,
  )
})

test('getSiteData falla si los ajustes no tienen ni correo ni Instagram', async () => {
  await expect(
    getSiteData('es', () => Promise.resolve({ ...empty, settings: { tagline: { es: 'Hola' } } })),
  ).rejects.toThrow(/correo.*Instagram/)
})

test('el recorte del panel se aplica a la foto y el punto de interés se traslada', () => {
  const data = toSiteData(
    {
      ...empty,
      settings: {
        email: 'a@b.c',
        heroPhotos: [
          {
            url: 'https://cdn.sanity.io/images/p/production/x-1000x2000.jpg',
            width: 1000,
            height: 2000,
            crop: { top: 0.1, bottom: 0.1, left: 0.2, right: 0 },
            hotspot: { x: 0.6, y: 0.3, width: 0.2, height: 0.2 },
          },
        ],
      },
    },
    'es',
  )
  const img = data.heroPhotos[0]
  expect(img.url).toBe('https://cdn.sanity.io/images/p/production/x-1000x2000.jpg?rect=200,200,800,1600')
  expect(img.width).toBe(800)
  expect(img.height).toBe(1600)
  // (0.6 - 0.2) / 0.8 = 50 %; (0.3 - 0.1) / 0.8 = 25 %
  expect(img.position).toBe('50% 25%')
})

test('sin recorte ni punto de interés la foto queda como está', () => {
  const data = toSiteData({ ...empty, settings: { email: 'a@b.c', aboutPhoto: { url: 'https://x/y.jpg', width: 10, height: 20 } } }, 'es')
  expect(data.aboutPhoto).toEqual({ url: 'https://x/y.jpg', width: 10, height: 20, alt: 'Jimena Melendez', position: undefined })
})

test('la portada de un vídeo también respeta recorte y punto de interés', () => {
  const data = toSiteData(
    {
      ...empty,
      videos: [
        {
          _id: 'v',
          title: { es: 'v' },
          videoUrl: 'https://x/v.mp4',
          poster: { url: 'https://x/p.jpg', width: 100, height: 200, hotspot: { x: 0.5, y: 0.2 } },
        },
      ],
    },
    'es',
  )
  expect(data.videos[0].posterUrl).toBe('https://x/p.jpg')
  expect(data.videos[0].posterPosition).toBe('50% 20%')
})
