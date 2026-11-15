import { expect, test } from './base'

test('con el interruptor encendido aparece la franja de marcas entre vídeos y servicios', async ({ page }) => {
  await page.goto('/')
  const brands = page.locator('#marcas')
  await expect(brands).toBeVisible()
  await expect(brands.locator('[data-brand]')).toHaveCount(2)
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
