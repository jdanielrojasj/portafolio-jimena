import { pick, type Locale } from './i18n'
import type { ActingItem, Img, RawImg, RawSite, SiteData, VideoItem } from './types'

const SITE_NAME = 'Jimena Melendez'

function toImg(raw: RawImg | null | undefined, alt: string): Img | undefined {
  if (!raw?.url) return undefined
  return { url: raw.url, width: raw.width ?? 0, height: raw.height ?? 0, alt }
}

function toImgs(raw: (RawImg | null | undefined)[] | null | undefined, alt: string): Img[] {
  return (raw ?? []).map((r) => toImg(r, alt)).filter((i): i is Img => i !== undefined)
}

/** Compara por número ascendente; los que no tienen número van al final. */
function byNumber(a: number | null | undefined, b: number | null | undefined): number {
  return (a ?? Infinity) - (b ?? Infinity) || 0
}

/** Convierte el contenido en bruto en lo que pinta la web, en un idioma. */
export function toSiteData(raw: RawSite, locale: Locale): SiteData {
  const s = raw.settings ?? {}
  const tr = (v: Parameters<typeof pick>[0]) => pick(v, locale)
  const list = (v: Parameters<typeof pick>[0][] | null | undefined) =>
    (v ?? []).map(tr).filter(Boolean)

  const videos: VideoItem[] = (raw.videos ?? [])
    .filter((v) => Boolean(v?.videoUrl))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || byNumber(a.order, b.order))
    .map((v) => ({
      id: v._id,
      title: tr(v.title),
      category: v.category ?? '',
      brand: v.brand || undefined,
      videoUrl: v.videoUrl!,
      posterUrl: v.poster?.url || undefined,
      description: tr(v.description),
      featured: Boolean(v.featured),
    }))

  const used = new Set(videos.map((v) => v.category))
  const categories = (raw.categories ?? [])
    .filter((c) => c?.slug && used.has(c.slug))
    .map((c) => ({ slug: c.slug!, title: tr(c.title) || c.slug! }))

  const actingWorks: ActingItem[] = (raw.actingWorks ?? [])
    .filter((a) => Boolean(a?.title))
    .sort((a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity) || 0)
    .map((a) => ({
      id: a._id,
      title: a.title!,
      kind: a.kind ?? 'otro',
      role: a.role ?? '',
      year: a.year ?? undefined,
      company: a.company ?? '',
      description: tr(a.description),
      photos: toImgs(a.photos, a.title!),
      videoUrl: a.videoUrl || undefined,
    }))

  return {
    locale,
    tagline: tr(s.tagline),
    marqueeWords: list(s.marqueeWords),
    heroPhotos: toImgs(s.heroPhotos, SITE_NAME),
    heroVideoUrl: s.heroVideoUrl || undefined,
    categories,
    videos,
    showBrands: Boolean(s.showBrands),
    brands: (raw.brands ?? [])
      .filter((b) => Boolean(b?.name))
      .map((b) => ({ name: b.name!, logoUrl: b.logoUrl || undefined })),
    services: (raw.services ?? [])
      .slice()
      .sort((a, b) => byNumber(a.order, b.order))
      .map((x) => ({ name: tr(x.name), description: tr(x.description) }))
      .filter((x) => x.name),
    actingWorks,
    showCasting: Boolean(s.showCasting),
    casting: {
      height: s.casting?.height?.trim() ?? '',
      hair: tr(s.casting?.hair),
      eyes: tr(s.casting?.eyes),
    },
    aboutText: tr(s.aboutText),
    aboutPhoto: toImg(s.aboutPhoto, SITE_NAME),
    languages: list(s.languages),
    email: s.email?.trim() ?? '',
    instagramUrl: s.instagramUrl?.trim() ?? '',
    tiktokUrl: s.tiktokUrl?.trim() || undefined,
  }
}

const fixtures = import.meta.glob<RawSite>('./fixtures/*.json', { eager: true, import: 'default' })

/**
 * Fuente por defecto: Sanity, o un archivo de prueba local si
 * USE_FIXTURES=1 (FIXTURE_FILE elige cuál; por defecto site.raw.json).
 */
async function defaultSource(): Promise<RawSite> {
  if (process.env.USE_FIXTURES === '1') {
    const file = process.env.FIXTURE_FILE || 'site.raw.json'
    const fixture = fixtures[`./fixtures/${file}`]
    if (!fixture) throw new Error(`no existe el archivo de prueba ${file}`)
    return fixture
  }
  const { fetchRawFromSanity } = await import('./sanity')
  return fetchRawFromSanity()
}

/**
 * Lee el contenido y lo prepara para un idioma. Si la lectura falla
 * (sin conexión, cuota agotada, respuesta vacía) lanza un error: la
 * construcción debe detenerse antes que publicar una web sin contenido.
 */
export async function getSiteData(
  locale: Locale,
  source: () => Promise<RawSite> = defaultSource,
): Promise<SiteData> {
  let raw: RawSite
  try {
    raw = await source()
    if (!raw || typeof raw !== 'object') throw new Error('respuesta vacía')
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause)
    throw new Error(`No se pudo leer el contenido de Sanity: ${reason}`, { cause })
  }
  return toSiteData(raw, locale)
}
