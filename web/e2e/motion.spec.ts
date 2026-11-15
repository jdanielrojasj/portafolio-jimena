import { expect, test } from './base'

const opacityOfFirstChild = (id: string) => (el: Element) => getComputedStyle(el.querySelector(':scope > *')!).opacity

test('con movimiento reducido todo es visible sin esperar y nada se mueve solo', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  for (const id of ['trabajo', 'servicios', 'actriz', 'sobre-mi', 'contacto'])
    expect(await page.locator(`#${id}`).evaluate(opacityOfFirstChild(id)), id).toBe('1')
  expect(await page.locator('#portada video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
  expect(
    await page.locator('[data-marquee] .track').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  expect(await page.locator('#portada [data-hero-piece]').first().evaluate((el) => getComputedStyle(el).transform)).toBe(
    'none',
  )
  await context.close()
})

test('sin JavaScript el contenido es visible', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('#portada h1')).toBeVisible()
  await expect(page.locator('#contacto h2')).toBeVisible()
  for (const id of ['servicios', 'actriz', 'contacto'])
    expect(await page.locator(`#${id}`).evaluate(opacityOfFirstChild(id)), id).toBe('1')
  // Sin JavaScript no hay botón de menú: los enlaces están a la vista.
  await expect(page.locator('#site-nav a').first()).toBeVisible()
  await context.close()
})

test('una sección lejana empieza oculta y aparece al llegar a ella', async ({ page }) => {
  await page.goto('/')
  const contact = page.locator('#contacto')
  await expect.poll(() => contact.evaluate(opacityOfFirstChild('contacto'))).toBe('0')
  await contact.scrollIntoViewIfNeeded()
  await expect.poll(() => contact.evaluate(opacityOfFirstChild('contacto'))).toBe('1')
})

test('el vídeo de portada se pone en marcha solo', async ({ page }) => {
  await page.goto('/')
  await expect
    .poll(() => page.locator('#portada video').evaluate((v: HTMLVideoElement) => v.dataset.autoplayed))
    .toBe('true')
})

test('la portada termina con el nombre y el botón visibles', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#portada h1')).toBeVisible()
  await expect
    .poll(() => page.locator('#portada .button').evaluate((el) => getComputedStyle(el.parentElement!).opacity))
    .toBe('1')
  await expect(page.locator('#portada').getByRole('link', { name: 'Trabajemos juntas' })).toBeInViewport()
})

test('al hacer scroll las piezas de la portada se desplazan a distinta velocidad', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1800) // deja terminar la animación de entrada
  await page.evaluate(() => window.scrollTo(0, 300))
  const pieces = page.locator('#portada [data-hero-piece]')
  await expect
    .poll(async () => {
      const t = await pieces.evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))
      return new Set(t).size
    })
    .toBe(3)
})
