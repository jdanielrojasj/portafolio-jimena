import { test as base, expect } from '@playwright/test'

// PNG de 1 × 1 px: sustituye a las fotos del contenido de prueba.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

/**
 * Las pruebas no salen a internet: las fotos y vídeos del contenido de
 * prueba (direcciones de cdn.sanity.io) se responden en local.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://cdn.sanity.io/**', (route) => {
      const isVideo = /\.mp4/.test(route.request().url())
      return route.fulfill({
        status: 200,
        contentType: isVideo ? 'video/mp4' : 'image/png',
        body: isVideo ? Buffer.alloc(0) : PIXEL,
      })
    })
    await use(page)
  },
})

export { expect }
