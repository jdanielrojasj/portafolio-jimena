import { pick, pickLang, type Locale } from './i18n'
import type { ActingItem, Img, RawImg, RawSite, SiteData, TestimonialItem, VideoItem } from './types'

const SITE_NAME = 'Jimena Meléndez'

const SOURCE_LABELS: Record<string, string> = { upwork: 'Upwork', linkedin: 'LinkedIn' }
const QUOTE_LANGS = new Set(['es', 'en', 'pt'])

/**
 * Enlace del panel solo si es http(s). El panel ya lo valida, pero la API no:
 * así un "javascript:" escrito por otra vía nunca llega a un href de la web.
 */
const httpUrl = (u: string | null | undefined): string | undefined => {
  const t = u?.trim()
  return t && /^https?:\/\//i.test(t) ? t : undefined
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const pct = (n: number) => `${Math.round(clamp01(n) * 1000) / 10}%`

/**
 * Aplica el recorte y el punto de interés que Jimena marca en el panel:
 * el recorte se pide a Sanity (parámetro rect) y el punto de interés se
 * traduce a object-position, para que object-fit: cover no corte caras.
 */
function toImg(raw: RawImg | null | undefined, alt: string): Img | undefined {
  if (!raw?.url) return undefined
  const W = raw.width ?? 0
  const H = raw.height ?? 0
  const c = { top: raw.crop?.top ?? 0, bottom: raw.crop?.bottom ?? 0, left: raw.crop?.left ?? 0, right: raw.crop?.right ?? 0 }
  const keepW = 1 - c.left - c.right
  const keepH = 1 - c.top - c.bottom
  const cropped = W > 0 && H > 0 && keepW > 0 && keepH > 0 && (c.top || c.bottom || c.left || c.right)

  let url = raw.url
  let width = W
  let height = H
  if (cropped) {
    const rect = [Math.round(c.left * W), Math.round(c.top * H), Math.round(keepW * W), Math.round(keepH * H)]
    url = `${raw.url}${raw.url.includes('?') ? '&' : '?'}rect=${rect.join(',')}`
    width = rect[2]
    height = rect[3]
  }

  const h = raw.hotspot
  const position =
    h && typeof h.x === 'number' && typeof h.y === 'number' && keepW > 0 && keepH > 0
      ? `${pct((h.x - c.left) / keepW)} ${pct((h.y - c.top) / keepH)}`
      : undefined

  return { url, width, height, alt, position }
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
  const trl = (v: Parameters<typeof pick>[0]) => pickLang(v, locale)
  const list = (v: Parameters<typeof pick>[0][] | null | undefined) =>
    (v ?? []).map(tr).filter(Boolean)

  const videos: VideoItem[] = (raw.videos ?? [])
    .filter((v) => Boolean(v?.videoUrl))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || byNumber(a.order, b.order))
    .map((v) => ({
      id: v._id,
      title: tr(v.title),
      titleLang: trl(v.title).lang,
      category: v.category ?? '',
      brand: v.brand || undefined,
      videoUrl: v.videoUrl!,
      posterUrl: toImg(v.poster, '')?.url,
      posterPosition: toImg(v.poster, '')?.position,
      description: tr(v.description),
      descriptionLang: trl(v.description).lang,
      featured: Boolean(v.featured),
    }))

  const used = new Set(videos.map((v) => v.category))
  const categories = (raw.categories ?? [])
    .filter((c) => c?.slug && used.has(c.slug))
    .map((c) => ({ slug: c.slug!, title: tr(c.title) || c.slug!, lang: trl(c.title).lang }))

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
      descriptionLang: trl(a.description).lang,
      photos: toImgs(a.photos, a.title!),
      videoUrl: a.videoUrl || undefined,
    }))

  // Campo "Orden" del panel; sin número, en el orden que llegan.
  const testimonials: TestimonialItem[] = (raw.testimonials ?? [])
    .filter((x) => Boolean(x?.quote?.trim()))
    .sort((a, b) => byNumber(a.order, b.order))
    .map((x) => ({
      id: x._id,
      quote: x.quote!.trim(),
      quoteLang: x.quoteLang && QUOTE_LANGS.has(x.quoteLang) ? x.quoteLang : 'en',
      author: x.author?.trim() ?? '',
      role: tr(x.role),
      roleLang: trl(x.role).lang,
      project: tr(x.project),
      projectLang: trl(x.project).lang,
      rating: typeof x.rating === 'number' && x.rating > 0 && x.rating <= 5 ? x.rating : undefined,
      source: x.source ?? '',
      sourceLabel: SOURCE_LABELS[x.source ?? ''] ?? '',
      sourceUrl: httpUrl(x.sourceUrl),
    }))

  return {
    locale,
    tagline: tr(s.tagline),
    taglineLang: trl(s.tagline).lang,
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
      .map((x) => ({
        name: tr(x.name),
        nameLang: trl(x.name).lang,
        description: tr(x.description),
        descriptionLang: trl(x.description).lang,
      }))
      .filter((x) => x.name),
    testimonials,
    actingWorks,
    showCasting: Boolean(s.showCasting),
    casting: {
      height: s.casting?.height?.trim() ?? '',
      hair: tr(s.casting?.hair),
      eyes: tr(s.casting?.eyes),
    },
    aboutText: tr(s.aboutText),
    aboutLang: trl(s.aboutText).lang,
    aboutPhoto: toImg(s.aboutPhoto, SITE_NAME),
    shareImage: toImg(s.shareImage, SITE_NAME) ?? toImgs(s.heroPhotos, SITE_NAME)[0],
    languages: list(s.languages),
    email: s.email?.trim() ?? '',
    instagramUrl: httpUrl(s.instagramUrl) ?? '',
    tiktokUrl: httpUrl(s.tiktokUrl),
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
    // Una respuesta válida pero sin ajustes publicados (por ejemplo, si se
    // despublica la ficha o el dataset no es público) dejaría una web vacía.
    if (!raw.settings) throw new Error('no hay "Ajustes de la web" publicados')
    if (!raw.settings.email?.trim() && !httpUrl(raw.settings.instagramUrl))
      throw new Error('"Ajustes de la web" no tiene ni correo ni Instagram de contacto')
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause)
    throw new Error(`No se pudo leer el contenido de Sanity: ${reason}`, { cause })
  }
  return toSiteData(raw, locale)
}
