import { expect, test } from './base'

test('sin contenido la página carga con portada y contacto, sin secciones vacías', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Jimena\s*Meléndez/)
  expect(await page.locator('main > section').evaluateAll((s) => s.map((x) => x.id))).toEqual(['portada', 'contacto'])
  await expect(page.locator('[data-marquee]')).toHaveCount(0)
  await expect(page.locator('#portada [data-hero-piece]')).toHaveCount(0)
})

test('sin contenido no aparecen textos rotos ni enlaces vacíos', async ({ page }) => {
  await page.goto('/')
  const text = await page.locator('body').innerText()
  expect(text).not.toMatch(/undefined|null|NaN/)
  await expect(page.locator('a[href="mailto:"]')).toHaveCount(0)
  await expect(page.locator('a[href=""]')).toHaveCount(0)
  // Sin línea de presentación en el panel se usa la de respaldo.
  await expect(page.locator('#portada')).toContainText('Actriz y creadora de contenido UGC')
})

test('sin contenido el menú solo enlaza el contacto y la versión en inglés también carga', async ({ page }) => {
  await page.goto('/en/')
  expect(await page.locator('#site-nav a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))).toEqual([
    '#contacto',
  ])
  await expect(page.locator('#portada')).toContainText('Actress & UGC creator')
})
