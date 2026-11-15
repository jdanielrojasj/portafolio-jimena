import { expect, test } from './base'

test('el orden de secciones es el aprobado', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('main > section').evaluateAll((s) => s.map((x) => x.id))).toEqual([
    'portada',
    'trabajo',
    'servicios',
    'actriz',
    'sobre-mi',
    'contacto',
  ])
})

test('con los interruptores apagados no hay franja de marcas ni ficha de casting', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#marcas')).toHaveCount(0)
  await expect(page.locator('[data-casting]')).toHaveCount(0)
})

test('los servicios salen en su orden y traducidos', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#servicios [data-service] h3')).toHaveText(['Servicio de prueba uno', 'Servicio de prueba dos'])
  await page.goto('/en/')
  await expect(page.locator('#servicios [data-service] h3')).toHaveText(['Sample service one', 'Sample service two'])
})

test('los trabajos de actriz van del más reciente al más antiguo, con personaje y año', async ({ page }) => {
  await page.goto('/')
  const works = page.locator('#actriz [data-acting-work]')
  await expect(works).toHaveCount(2)
  await expect(works.nth(0)).toContainText('Cortometraje de prueba reciente')
  await expect(works.nth(0)).toContainText('Protagonista de prueba')
  await expect(works.nth(0)).toContainText('2024')
  await expect(works.nth(1)).toContainText('Obra de prueba antigua')
  await expect(works.nth(1)).toContainText('Compañía de prueba')
})

test('la sección de actriz tiene fondo oscuro', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('#actriz').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(22, 21, 20)')
})

test('el vídeo de un trabajo de actriz se abre en el reproductor', async ({ page }) => {
  await page.goto('/')
  await page.locator('#actriz').getByRole('button', { name: /Ver vídeo/ }).click()
  await expect(page.locator('dialog[open] video')).toHaveAttribute('src', /corto-reciente\.mp4$/)
})

test('una foto de escena se abre ampliada y se cierra', async ({ page }) => {
  await page.goto('/')
  await page.locator('#actriz [data-lightbox-image]').first().click()
  const img = page.locator('dialog[open] img')
  await expect(img).toHaveAttribute('src', /escena-1/)
  await expect(img).toHaveAttribute('alt', 'Obra de prueba antigua')
  await expect(page.locator('dialog[open] video')).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(page.locator('dialog img')).toHaveCount(0)
})

test('sobre mí muestra el texto, la foto y los idiomas', async ({ page }) => {
  await page.goto('/en/')
  const about = page.locator('#sobre-mi')
  await expect(about).toContainText('Sample about text')
  await expect(about.locator('img')).toHaveAttribute('alt', 'Jimena Meléndez')
  await expect(about.locator('[data-languages] li')).toHaveText(['Spanish (native)', 'English', 'Portuguese'])
})

test('el contacto ofrece correo, Instagram y TikTok, y ningún formulario', async ({ page }) => {
  await page.goto('/')
  const contact = page.locator('#contacto')
  await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1)
  await expect(contact.locator('a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:prueba@example.com')
  const instagram = contact.locator('a[href*="instagram.com"]')
  await expect(instagram).toHaveCount(1)
  await expect(instagram).toHaveAttribute('target', '_blank')
  await expect(instagram).toHaveAttribute('rel', /noopener/)
  await expect(contact.locator('a[href*="tiktok.com"]')).toHaveCount(1)
  await expect(page.locator('form')).toHaveCount(0)
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)
})

test('el menú enlaza todas las secciones presentes', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('#site-nav a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))).toEqual([
    '#trabajo',
    '#servicios',
    '#actriz',
    '#sobre-mi',
    '#contacto',
  ])
})

test('cada sección tiene un título de nivel 2', async ({ page }) => {
  await page.goto('/')
  for (const id of ['trabajo', 'servicios', 'actriz', 'sobre-mi', 'contacto'])
    await expect(page.locator(`#${id} h2`)).toHaveCount(1)
})
