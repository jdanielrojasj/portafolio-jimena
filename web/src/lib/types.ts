import type { Locale, Localized } from './i18n'

// ---------- Contenido listo para pintar ----------

export interface Img {
  url: string
  width: number
  height: number
  alt: string
  /** `object-position` CSS del punto de interés marcado en el panel. */
  position?: string
}

export interface VideoItem {
  id: string
  title: string
  /** 'es' si el título cayó al español en otra versión. */
  titleLang?: Locale
  /** Identificador del tipo de vídeo; cadena vacía si no tiene. */
  category: string
  brand?: string
  videoUrl: string
  posterUrl?: string
  posterPosition?: string
  description: string
  descriptionLang?: Locale
  featured: boolean
}

export interface ActingItem {
  id: string
  title: string
  kind: string
  role: string
  year?: number
  company: string
  description: string
  descriptionLang?: Locale
  photos: Img[]
  videoUrl?: string
}

export interface TestimonialItem {
  id: string
  /** Texto exacto, en su idioma original. */
  quote: string
  /** Idioma del texto: 'es', 'en' o 'pt'. */
  quoteLang: string
  /** Vacío si no se sabe quién la escribió. */
  author: string
  role: string
  roleLang?: Locale
  project: string
  projectLang?: Locale
  /** Estrellas sobre 5; sin valor si no hubo puntuación. */
  rating?: number
  /** 'upwork', 'linkedin', 'directo' o vacío. */
  source: string
  /** Nombre visible de la fuente ('Upwork', 'LinkedIn') o vacío. */
  sourceLabel: string
  sourceUrl?: string
}

export interface SiteData {
  locale: Locale
  tagline: string
  taglineLang?: Locale
  marqueeWords: string[]
  heroPhotos: Img[]
  heroVideoUrl?: string
  /** Solo los tipos que tienen al menos un vídeo. */
  categories: { slug: string; title: string; lang?: Locale }[]
  /** Destacados primero; después por `order`. */
  videos: VideoItem[]
  showBrands: boolean
  brands: { name: string; logoUrl?: string }[]
  services: { name: string; nameLang?: Locale; description: string; descriptionLang?: Locale }[]
  /** En el orden que marca Jimena. */
  testimonials: TestimonialItem[]
  /** Del más reciente al más antiguo. */
  actingWorks: ActingItem[]
  showCasting: boolean
  casting: { height: string; hair: string; eyes: string }
  aboutText: string
  aboutLang?: Locale
  aboutPhoto?: Img
  /** Foto para la vista previa al compartir el enlace. */
  shareImage?: Img
  languages: string[]
  email: string
  instagramUrl: string
  tiktokUrl?: string
}

// ---------- Contenido en bruto, tal como lo devuelve la consulta ----------

type Maybe<T> = T | null | undefined

export interface RawImg {
  url?: Maybe<string>
  width?: Maybe<number>
  height?: Maybe<number>
  /** Recorte del panel, en fracciones de cada borde. */
  crop?: Maybe<{ top?: number; bottom?: number; left?: number; right?: number }>
  /** Punto de interés del panel, en fracciones de la imagen original. */
  hotspot?: Maybe<{ x?: number; y?: number; width?: number; height?: number }>
}

export interface RawSettings {
  tagline?: Localized
  marqueeWords?: Maybe<Localized[]>
  heroPhotos?: Maybe<Maybe<RawImg>[]>
  heroVideoUrl?: Maybe<string>
  aboutText?: Localized
  aboutPhoto?: Maybe<RawImg>
  shareImage?: Maybe<RawImg>
  languages?: Maybe<Localized[]>
  email?: Maybe<string>
  instagramUrl?: Maybe<string>
  tiktokUrl?: Maybe<string>
  showBrands?: Maybe<boolean>
  showCasting?: Maybe<boolean>
  casting?: Maybe<{ height?: Maybe<string>; hair?: Localized; eyes?: Localized }>
}

export interface RawVideo {
  _id: string
  title?: Localized
  category?: Maybe<string>
  brand?: Maybe<string>
  videoUrl?: Maybe<string>
  poster?: Maybe<RawImg>
  description?: Localized
  featured?: Maybe<boolean>
  order?: Maybe<number>
}

export interface RawActing {
  _id: string
  title?: Maybe<string>
  kind?: Maybe<string>
  role?: Maybe<string>
  year?: Maybe<number>
  company?: Maybe<string>
  description?: Localized
  photos?: Maybe<Maybe<RawImg>[]>
  videoUrl?: Maybe<string>
}

export interface RawSite {
  settings: Maybe<RawSettings>
  categories: Maybe<{ slug?: Maybe<string>; title?: Localized }[]>
  videos: Maybe<RawVideo[]>
  actingWorks: Maybe<RawActing[]>
  brands: Maybe<{ name?: Maybe<string>; logoUrl?: Maybe<string> }[]>
  services: Maybe<{ name?: Localized; description?: Localized; order?: Maybe<number> }[]>
  testimonials?: Maybe<RawTestimonial[]>
}

export interface RawTestimonial {
  _id: string
  quote?: Maybe<string>
  quoteLang?: Maybe<string>
  author?: Maybe<string>
  role?: Localized
  project?: Localized
  rating?: Maybe<number>
  source?: Maybe<string>
  sourceUrl?: Maybe<string>
  order?: Maybe<number>
}
