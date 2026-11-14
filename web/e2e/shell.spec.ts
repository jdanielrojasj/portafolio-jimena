import { expect, test } from './base'

test('la raíz está en español y /en/ en inglés', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await page.goto('/en/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('el selector cambia de idioma y vuelve', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/$/)
  await page.getByRole('link', { name: 'ES', exact: true }).click()
  await expect(page).toHaveURL(/:\d+\/$/)
})

test('el selector marca el idioma actual', async ({ page }) => {
  await page.goto('/en/')
  await expect(page.getByRole('link', { name: 'EN', exact: true })).toHaveAttribute('aria-current', 'true')
  await expect(page.getByRole('link', { name: 'ES', exact: true })).not.toHaveAttribute('aria-current', 'true')
})

test('declara las versiones alternativas', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveCount(1)
})

test('el título y la descripción están en el idioma de la página', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Jimena Melendez/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Actriz/)
  await page.goto('/en/')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Actress/)
})

test('sin scroll horizontal a 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('no carga nada de terceros salvo el contenido de Sanity', async ({ page }) => {
  const hosts = new Set<string>()
  page.on('request', (r) => {
    const u = new URL(r.url())
    if (u.protocol.startsWith('http')) hosts.add(u.hostname)
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  for (const h of hosts) expect(['127.0.0.1', 'cdn.sanity.io']).toContain(h)
})

test('no guarda cookies', async ({ page, context }) => {
  await page.goto('/')
  expect(await context.cookies()).toEqual([])
})

test('el menú del móvil se abre y lleva a una sección', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo en móvil')
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Menú' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('navigation').getByRole('link', { name: 'Contacto' }).click()
  await expect(page).toHaveURL(/#contacto$/)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
})
