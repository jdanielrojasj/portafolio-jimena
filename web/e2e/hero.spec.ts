import { expect, test } from './base'

test('la portada muestra nombre, línea y un único botón de contacto', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('#portada')
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText(/Jimena\s*Melendez/)
  await expect(hero.getByText('Actriz y creadora de contenido UGC')).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Trabajemos juntas' })).toHaveAttribute('href', '#contacto')
  await expect(hero.getByRole('link')).toHaveCount(1)
})

test('el vídeo de portada va en silencio, en bucle y sin controles', async ({ page }) => {
  await page.goto('/')
  const state = await page
    .locator('#portada video')
    .evaluate((el: HTMLVideoElement) => ({ muted: el.muted, loop: el.loop, inline: el.playsInline, controls: el.controls }))
  expect(state).toEqual({ muted: true, loop: true, inline: true, controls: false })
})

test('la portada muestra las dos fotos a los lados del vídeo', async ({ page }) => {
  await page.goto('/')
  const media = page.locator('#portada [data-hero-piece]')
  await expect(media).toHaveCount(3)
  expect(await media.evaluateAll((els) => els.map((e) => e.querySelector('video, img')!.tagName))).toEqual([
    'IMG',
    'VIDEO',
    'IMG',
  ])
})

test('las fotos de portada llevan texto alternativo y tamaño', async ({ page }) => {
  await page.goto('/')
  for (const img of await page.locator('#portada img').all()) {
    await expect(img).toHaveAttribute('alt', 'Jimena Melendez')
    await expect(img).toHaveAttribute('width', /\d+/)
    await expect(img).toHaveAttribute('height', /\d+/)
  }
})

test('en inglés la línea y el botón están traducidos', async ({ page }) => {
  await page.goto('/en/')
  const hero = page.locator('#portada')
  await expect(hero.getByText('Actress & UGC creator')).toBeVisible()
  await expect(hero.getByRole('link', { name: "Let's work together" })).toBeVisible()
})

test('la franja de palabras está oculta para lectores de pantalla y cae al español', async ({ page }) => {
  await page.goto('/en/')
  const marquee = page.locator('[data-marquee]')
  await expect(marquee).toHaveAttribute('aria-hidden', 'true')
  await expect(marquee).toContainText('Reviews')
  await expect(marquee).toContainText('Unboxing')
})
