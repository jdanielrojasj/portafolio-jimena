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
  /** Identificador del tipo de vídeo; cadena vacía si no tiene. */
  category: string
  brand?: string
  videoUrl: string
  posterUrl?: string
  posterPosition?: string
  description: string
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
  photos: Img[]
  videoUrl?: string
}

export interface SiteData {
  locale: Locale
  tagline: string
  marqueeWords: string[]
  heroPhotos: Img[]
  heroVideoUrl?: string
  /** Solo los tipos que tienen al menos un vídeo. */
  categories: { slug: string; title: string }[]
  /** Destacados primero; después por `order`. */
  videos: VideoItem[]
  showBrands: boolean
  brands: { name: string; logoUrl?: string }[]
  services: { name: string; description: string }[]
  /** Del más reciente al más antiguo. */
  actingWorks: ActingItem[]
  showCasting: boolean
  casting: { height: string; hair: string; eyes: string }
  aboutText: string
  aboutPhoto?: Img
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
}
