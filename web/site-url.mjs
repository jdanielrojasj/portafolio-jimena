// @ts-check
/**
 * Dirección pública de la web (canonical, hreflang, og:url).
 * - SITE_URL, si está definida.
 * - En una vista previa de Cloudflare, la dirección de esa publicación.
 * - En la publicación principal (rama main) sin SITE_URL, se detiene la
 *   construcción: los enlaces apuntarían a una dirección temporal.
 * @param {Record<string, string | undefined>} env
 * @returns {string | undefined}
 */
export function resolveSite(env) {
  if (env.SITE_URL) return env.SITE_URL
  if (env.CF_PAGES_BRANCH === 'main') {
    throw new Error(
      'Falta la variable de entorno SITE_URL en Cloudflare Pages (por ejemplo https://jimenamelendez.pages.dev).',
    )
  }
  return env.CF_PAGES_URL || undefined
}
