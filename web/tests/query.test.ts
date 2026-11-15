import { evaluate, parse } from 'groq-js'
import { expect, test } from 'vitest'
import { SITE_QUERY } from '../src/lib/queries'
import { toSiteData } from '../src/lib/site-data'
import type { RawSite } from '../src/lib/types'

// Documentos con la misma forma que guarda el panel (studio/schemaTypes):
// las imágenes y archivos son referencias a documentos de recurso aparte.
const CDN = 'https://cdn.sanity.io'
const imageAsset = (id: string, w: number, h: number) => ({
  _id: `image-${id}-${w}x${h}-jpg`,
  _type: 'sanity.imageAsset',
  url: `${CDN}/images/p/production/${id}-${w}x${h}.jpg`,
  metadata: { dimensions: { width: w, height: h } },
})
const fileAsset = (id: string) => ({ _id: `file-${id}-mp4`, _type: 'sanity.fileAsset', url: `${CDN}/files/p/production/${id}.mp4` })
const image = (asset: { _id: string }, extra = {}) => ({ _type: 'image', asset: { _type: 'reference', _ref: asset._id }, ...extra })
const file = (asset: { _id: string }) => ({ _type: 'file', asset: { _type: 'reference', _ref: asset._id } })
const ref = (_ref: string) => ({ _type: 'reference', _ref })

const retrato = imageAsset('retrato', 1200, 1500)
const portada = imageAsset('portada', 1080, 1920)
const escena = imageAsset('escena', 1600, 1067)
const logo = imageAsset('logo', 400, 200)
const montaje = fileAsset('montaje')
const clip = fileAsset('clip')
const corto = fileAsset('corto')

const dataset = [
  retrato, portada, escena, logo, montaje, clip, corto,
  {
    _id: 'siteSettings',
    _type: 'siteSettings',
    tagline: { _type: 'localeString', es: 'Actriz', en: 'Actress' },
    heroPhotos: [image(retrato, { _key: 'a', hotspot: { x: 0.5, y: 0.25, width: 0.3, height: 0.3 } })],
    heroVideo: file(montaje),
    marqueeWords: [{ _key: 'm', es: 'UGC' }],
    aboutText: { es: 'Hola' },
    aboutPhoto: image(retrato),
    languages: [{ _key: 'l', es: 'Español' }],
    email: 'prueba@example.com',
    instagramUrl: 'https://www.instagram.com/prueba/',
    tiktokUrl: 'https://www.tiktok.com/@prueba',
    showBrands: true,
    showCasting: true,
    casting: { height: '1,60 m', hair: { es: 'Castaño' }, eyes: { es: 'Marrones' } },
  },
  // Un borrador nunca debe aparecer: la consulta pide el documento publicado por su id.
  { _id: 'drafts.siteSettings', _type: 'siteSettings', email: 'borrador@example.com' },
  { _id: 'cat-review', _type: 'videoCategory', title: { es: 'Reseña', en: 'Review' }, slug: { _type: 'slug', current: 'review' } },
  { _id: 'brand-1', _type: 'brand', name: 'Marca', logo: image(logo) },
  {
    _id: 'video-1',
    _type: 'videoPiece',
    _createdAt: '2026-01-01T00:00:00Z',
    title: { es: 'Vídeo', en: 'Video' },
    category: ref('cat-review'),
    brand: ref('brand-1'),
    video: file(clip),
    poster: image(portada, { crop: { top: 0, bottom: 0.5, left: 0, right: 0 } }),
    featured: true,
  },
  {
    _id: 'acting-1',
    _type: 'actingWork',
    _createdAt: '2026-01-01T00:00:00Z',
    title: 'Obra',
    kind: 'teatro',
    role: 'Papel',
    year: 2024,
    photos: [image(escena, { _key: 'p' })],
    video: file(corto),
  },
  { _id: 'service-1', _type: 'service', _createdAt: '2026-01-01T00:00:00Z', name: { es: 'UGC' }, order: 1 },
]

async function run(): Promise<RawSite> {
  const result = await evaluate(parse(SITE_QUERY), { dataset })
  return (await result.get()) as RawSite
}

test('la consulta resuelve los archivos y las imágenes del panel', async () => {
  const data = toSiteData(await run(), 'en')
  expect(data.heroVideoUrl).toBe(montaje.url)
  expect(data.heroPhotos[0]).toMatchObject({ url: retrato.url, width: 1200, height: 1500, position: '50% 25%' })
  expect(data.aboutPhoto?.url).toBe(retrato.url)
  expect(data.videos[0].videoUrl).toBe(clip.url)
  expect(data.actingWorks[0].videoUrl).toBe(corto.url)
  expect(data.actingWorks[0].photos[0]).toMatchObject({ url: escena.url, width: 1600, height: 1067 })
  expect(data.brands[0].logoUrl).toBe(logo.url)
})

test('la consulta sigue las referencias de tipo y marca', async () => {
  const data = toSiteData(await run(), 'en')
  expect(data.videos[0]).toMatchObject({ category: 'review', brand: 'Marca', title: 'Video', featured: true })
  expect(data.categories).toEqual([{ slug: 'review', title: 'Review' }])
})

test('la consulta trae el recorte de la portada del vídeo', async () => {
  const data = toSiteData(await run(), 'es')
  expect(data.videos[0].posterUrl).toBe(`${portada.url}?rect=0,0,1080,960`)
})

test('la consulta trae ajustes, servicios y trabajos, y nunca el borrador', async () => {
  const data = toSiteData(await run(), 'es')
  expect(data.email).toBe('prueba@example.com')
  expect(data.tagline).toBe('Actriz')
  expect(data.showBrands).toBe(true)
  expect(data.casting).toEqual({ height: '1,60 m', hair: 'Castaño', eyes: 'Marrones' })
  expect(data.services).toEqual([{ name: 'UGC', description: '' }])
  expect(data.actingWorks[0]).toMatchObject({ title: 'Obra', role: 'Papel', year: 2024, kind: 'teatro' })
})
