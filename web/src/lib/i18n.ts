export type Locale = 'es' | 'en'

export const LOCALES: readonly Locale[] = ['es', 'en']
export const DEFAULT_LOCALE: Locale = 'es'

/** Texto en dos idiomas tal como llega del panel. */
export type Localized = { es?: string | null; en?: string | null } | null | undefined

/**
 * Devuelve el texto en el idioma pedido. Si falta o está en blanco,
 * devuelve el español; si tampoco hay, cadena vacía.
 */
export function pick(value: Localized, locale: Locale): string {
  const wanted = value?.[locale]?.trim()
  if (wanted) return wanted
  return value?.[DEFAULT_LOCALE]?.trim() ?? ''
}

/**
 * Como pick(), pero indica si el texto cayó al español en otra versión,
 * para marcarlo con lang="es" y que los lectores de pantalla lo lean bien.
 */
export function pickLang(value: Localized, locale: Locale): { text: string; lang: Locale | undefined } {
  const text = pick(value, locale)
  const own = value?.[locale]?.trim()
  return { text, lang: text && !own && locale !== DEFAULT_LOCALE ? DEFAULT_LOCALE : undefined }
}

/** Ruta de la portada en un idioma, con ancla opcional a una sección. */
export function localePath(locale: Locale, hash?: string): string {
  const base = locale === DEFAULT_LOCALE ? '/' : `/${locale}/`
  return hash ? `${base}#${hash}` : base
}

const ui = {
  'nav.work': { es: 'Vídeos', en: 'Videos' },
  'nav.services': { es: 'Servicios', en: 'Services' },
  'nav.acting': { es: 'Actriz', en: 'Acting' },
  'nav.about': { es: 'Sobre mí', en: 'About' },
  'nav.contact': { es: 'Contacto', en: 'Contact' },
  'nav.menu': { es: 'Menú', en: 'Menu' },
  'nav.close': { es: 'Cerrar menú', en: 'Close menu' },
  'nav.home': { es: 'Inicio', en: 'Home' },
  'cta.work': { es: 'Trabajemos juntas', en: "Let's work together" },
  'filter.all': { es: 'Todos', en: 'All' },
  'filter.label': { es: 'Filtrar por tipo', en: 'Filter by type' },
  'section.work': { es: 'Contenido para marcas', en: 'Content for brands' },
  'section.services': { es: 'Servicios', en: 'Services' },
  'section.acting': { es: 'Actriz', en: 'Acting' },
  'section.about': { es: 'Sobre mí', en: 'About me' },
  'section.contact': { es: 'Trabajemos juntas', en: "Let's work together" },
  'section.brands': { es: 'Marcas con las que he trabajado', en: 'Brands I have worked with' },
  'acting.kind.teatro': { es: 'Teatro', en: 'Theatre' },
  'acting.kind.cortometraje': { es: 'Cortometraje', en: 'Short film' },
  'acting.kind.taller': { es: 'Taller', en: 'Workshop' },
  'acting.kind.otro': { es: 'Otro', en: 'Other' },
  'acting.photos': { es: 'Ver fotos', en: 'View photos' },
  'acting.video': { es: 'Ver vídeo', en: 'Watch video' },
  'casting.title': { es: 'Datos', en: 'Stats' },
  'casting.height': { es: 'Altura', en: 'Height' },
  'casting.hair': { es: 'Pelo', en: 'Hair' },
  'casting.eyes': { es: 'Ojos', en: 'Eyes' },
  'about.languages': { es: 'Idiomas', en: 'Languages' },
  'contact.email': { es: 'Escríbeme por correo', en: 'Email me' },
  'contact.instagram': { es: 'Escríbeme por Instagram', en: 'Message me on Instagram' },
  'contact.tiktok': { es: 'Ver mi TikTok', en: 'See my TikTok' },
  'video.play': { es: 'Reproducir', en: 'Play' },
  'video.close': { es: 'Cerrar', en: 'Close' },
  'lang.switch': { es: 'Cambiar idioma', en: 'Change language' },
  'skip': { es: 'Saltar al contenido', en: 'Skip to content' },
  'services.eyebrow': { es: 'Qué ofrezco', en: 'What I offer' },
  'acting.eyebrow': { es: 'Teatro y cámara', en: 'Stage and screen' },
  'contact.eyebrow': { es: 'Contacto', en: 'Contact' },
  'hero.reel': { es: 'Montaje de vídeos de Jimena Meléndez', en: 'Showreel of Jimena Meléndez' },
  'motion.pause': { es: 'Pausar movimiento', en: 'Pause motion' },
  'meta.role': { es: 'Actriz y creadora de contenido UGC', en: 'Actress & UGC creator' },
} as const satisfies Record<string, Record<Locale, string>>

export type UiKey = keyof typeof ui

export const UI_KEYS = Object.keys(ui) as UiKey[]

/** Textos fijos de la interfaz (los que no se editan desde el panel). */
export function t(locale: Locale, key: UiKey): string {
  return ui[key][locale]
}
