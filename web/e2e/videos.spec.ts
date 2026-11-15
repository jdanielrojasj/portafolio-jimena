import { expect, test } from './base'

const cards = '#trabajo [data-video-card]:visible'

test('la sección lista todos los vídeos, destacados primero', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator(cards)).toHaveCount(4)
  await expect(page.locator(cards).first()).toHaveAttribute('data-id', 'destacado')
})

test('filtrar muestra solo los vídeos de ese tipo y "Todos" los recupera', async ({ page }) => {
  await page.goto('/')
  const all = page.getByRole('button', { name: 'Todos', exact: true })
  const unboxing = page.getByRole('button', { name: 'Unboxing', exact: true })
  await expect(all).toHaveAttribute('aria-pressed', 'true')

  await unboxing.click()
  await expect(unboxing).toHaveAttribute('aria-pressed', 'true')
  await expect(all).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator(cards)).toHaveCount(2)
  expect(await page.locator(cards).evaluateAll((els) => els.map((e) => e.getAttribute('data-category')))).toEqual([
    'unboxing',
    'unboxing',
  ])

  await all.click()
  await expect(page.locator(cards)).toHaveCount(4)
})

test('no hay filtro para un tipo sin vídeos y en inglés se traducen', async ({ page }) => {
  await page.goto('/en/')
  await expect(page.locator('#trabajo [data-filter]')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Review', exact: true })).toBeVisible()
})

test('no se descarga ningún vídeo con portada antes de abrirlo', async ({ page }) => {
  const mp4: string[] = []
  page.on('request', (r) => {
    if (/\.mp4/.test(r.url())) mp4.push(r.url())
  })
  await page.goto('/')
  await page.locator('#trabajo').scrollIntoViewIfNeeded()
  await page.waitForLoadState('networkidle')
  // Solo se piden el montaje de la portada y el vídeo que no tiene imagen de portada.
  const unexpected = mp4.filter((u) => !u.includes('hero-montaje') && !u.includes('sin-poster'))
  expect(unexpected).toEqual([])
})

test('abrir un vídeo lo carga con sonido y controles', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-video-card][data-id="destacado"]').click()
  const video = page.locator('dialog[open] video')
  await expect(video).toBeVisible()
  await expect(video).toHaveAttribute('src', /destacado\.mp4$/)
  expect(await video.evaluate((el: HTMLVideoElement) => ({ muted: el.muted, controls: el.controls }))).toEqual({
    muted: false,
    controls: true,
  })
  await expect(page.locator('dialog[open]')).toContainText('Vídeo de prueba destacado')
})

test('Escape cierra el reproductor, libera el vídeo y devuelve el foco', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('[data-video-card][data-id="destacado"]')
  await card.click()
  await expect(page.locator('dialog[open]')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  await expect(page.locator('dialog video')).not.toHaveAttribute('src', /.+/)
  await expect(card).toBeFocused()
})

test('el botón de cerrar cierra el reproductor', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-video-card]').first().click()
  await page.locator('dialog[open]').getByRole('button', { name: 'Cerrar' }).click()
  await expect(page.locator('dialog[open]')).toHaveCount(0)
})

test('las tarjetas se abren con el teclado', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-video-card]').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('dialog[open]')).toHaveCount(1)
})

test('la tarjeta sin portada muestra el primer instante del vídeo', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('[data-video-card][data-id="sin-poster"]')
  await expect(card.locator('video')).toHaveCount(1)
  await expect(card.locator('video')).toHaveAttribute('src', /sin-poster\.mp4#t=0\.1$/)
  await expect(card.locator('img')).toHaveCount(0)
})

test('un título de 90 caracteres no desborda a 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  const item = page.locator('[data-video-item]:has([data-id="titulo-largo"])')
  await item.scrollIntoViewIfNeeded()
  expect(await item.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('en inglés, lo que solo está en español va marcado como español', async ({ page }) => {
  await page.goto('/en/')
  await expect(page.locator('[data-video-item]:has([data-id="sin-en"]) h3')).toHaveAttribute('lang', 'es')
  await expect(page.locator('[data-video-item]:has([data-id="destacado"]) h3')).not.toHaveAttribute('lang', /.+/)
  await expect(page.getByRole('button', { name: 'Unboxing', exact: true })).toHaveAttribute('lang', 'es')
  await expect(page.locator('#servicios [data-service]').nth(1).locator('p')).toHaveAttribute('lang', 'es')
})

test('en español no se añade lang a los textos', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main [lang]')).toHaveCount(0)
})
