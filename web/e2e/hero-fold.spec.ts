import { expect, test } from './base'

// Al abrir la web, sin hacer scroll, se ven el nombre, el botón de
// contacto, el vídeo del centro y las dos fotos de los lados.
// Se mide con movimiento reducido para ver la posición final, sin la
// animación de entrada ni el desplazamiento al hacer scroll.
test.use({ reducedMotion: 'reduce' })

const SIZES = {
  escritorio: [
    { width: 1536, height: 748, name: 'portátil con pantalla baja' },
    { width: 1440, height: 900, name: 'portátil' },
    { width: 1280, height: 720, name: 'portátil pequeño' },
    { width: 1920, height: 1080, name: 'monitor' },
    { width: 1024, height: 768, name: 'tableta horizontal' },
  ],
  movil: [
    { width: 390, height: 844, name: 'móvil' },
    { width: 375, height: 667, name: 'móvil pequeño' },
    { width: 768, height: 1024, name: 'tableta vertical' },
  ],
}

for (const [project, sizes] of Object.entries(SIZES)) {
  for (const size of sizes) {
    test(`primera vista completa en ${size.name} (${size.width}×${size.height})`, async ({ page }, info) => {
      test.skip(info.project.name !== project, `solo en el proyecto ${project}`)
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.goto('/')

      const m = await page.evaluate(() => {
        const box = (el: Element | null) => el!.getBoundingClientRect()
        const pieces = [...document.querySelectorAll('#portada [data-hero-piece]')].map((p) => {
          const r = box(p)
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height }
        })
        return {
          vw: document.documentElement.clientWidth,
          vh: window.innerHeight,
          h1: box(document.querySelector('#portada h1')),
          button: box(document.querySelector('#portada .button')),
          main: box(document.querySelector('#portada .piece--main')),
          pieces,
        }
      })

      expect(m.pieces).toHaveLength(3)
      // Todo dentro de la pantalla, sin scroll.
      expect(m.h1.top).toBeGreaterThanOrEqual(0)
      expect(m.button.bottom).toBeLessThanOrEqual(m.vh)
      for (const p of m.pieces) {
        expect(p.top, 'pieza por arriba').toBeGreaterThanOrEqual(m.h1.bottom - 1)
        expect(p.bottom, 'pieza por abajo').toBeLessThanOrEqual(m.vh)
        expect(p.left, 'pieza por la izquierda').toBeGreaterThanOrEqual(0)
        expect(p.right, 'pieza por la derecha').toBeLessThanOrEqual(m.vw)
      }
      // El vídeo del centro es la pieza más alta y tiene presencia.
      expect(m.main.height).toBe(Math.max(...m.pieces.map((p) => p.height)))
      expect(m.main.height, 'altura del vídeo').toBeGreaterThanOrEqual(m.vh * 0.25)
    })
  }
}
