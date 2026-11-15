/** Dirección de una imagen de Sanity al ancho pedido, en formato moderno. */
export function sized(url: string, width: number): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}w=${width}&auto=format&fit=max&q=75`
}

/**
 * Lista de tamaños para que el navegador elija el adecuado a la pantalla.
 * No ofrece anchos mayores que el original (si se conoce).
 */
export function srcset(url: string, widths: number[], originalWidth: number): string {
  const usable = originalWidth > 0 ? widths.filter((w) => w < originalWidth) : widths
  const all = originalWidth > 0 ? [...usable, originalWidth] : usable
  return all.map((w) => `${sized(url, w)} ${w}w`).join(', ')
}
