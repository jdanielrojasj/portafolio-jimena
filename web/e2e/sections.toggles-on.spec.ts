import { expect, test } from './base'

test('con el interruptor encendido aparece la franja de marcas entre vídeos y servicios', async ({ page }) => {
  await page.goto('/')
  const brands = page.locator('#marcas')
  await expect(brands).toBeVisible()
  await expect(brands.locator('[data-brand]')).toHaveCount(3)
  await expect(brands).toContainText('Marca de prueba')
  // La marca con logo muestra la imagen con su nombre como texto alternativo.
  await expect(brands.locator('img')).toHaveAttribute('alt', 'Otra marca de prueba')
  expect(await page.locator('main > section').evaluateAll((s) => s.map((x) => x.id))).toEqual([
    'portada',
    'trabajo',
    'marcas',
    'servicios',
    'actriz',
    'sobre-mi',
    'contacto',
  ])
})

test('con el interruptor encendido aparece la ficha de casting, traducida', async ({ page }) => {
  await page.goto('/')
  const casting = page.locator('#actriz [data-casting]')
  await expect(casting).toBeVisible()
  await expect(casting).toContainText('Altura')
  await expect(casting).toContainText('1,60 m')
  await expect(casting).toContainText('Castaño')
  await page.goto('/en/')
  await expect(page.locator('#actriz [data-casting]')).toContainText('Height')
  await expect(page.locator('#actriz [data-casting]')).toContainText('Brown')
})

test('a 320 px ninguna palabra larga se sale de la pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  // body tiene overflow-x: clip, así que no basta con mirar el scroll:
  // se comprueba que cada texto termina dentro de la pantalla.
  const selectors = [
    'h1',
    'h2',
    '#trabajo [data-filter]',
    '#marcas [data-brand]',
    '#servicios h3',
    '#actriz h3',
    '#contacto .headline',
    '#contacto .email',
  ]
  for (const selector of selectors) {
    const outside = await page.locator(selector).evaluateAll((els) =>
      els.filter((el) => el.getBoundingClientRect().right > 320.5).map((el) => el.textContent?.trim()),
    )
    expect(outside, selector).toEqual([])
  }
  // Las tarjetas del carrusel se deslizan, pero su texto no debe salirse de la tarjeta.
  const cards = await page.locator('[data-video-item]').evaluateAll((els) =>
    els.filter((el) => el.scrollWidth > el.clientWidth).map((el) => el.querySelector('h3')?.textContent),
  )
  expect(cards).toEqual([])
})
