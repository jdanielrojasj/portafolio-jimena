import { expect, test } from 'vitest'
import { sized, srcset } from '../src/lib/image'

const url = 'https://cdn.sanity.io/images/p/production/abc-1200x1500.jpg'

test('sized pide la imagen al ancho indicado y en formato moderno', () => {
  expect(sized(url, 640)).toBe(`${url}?w=640&auto=format&fit=max&q=75`)
})

test('sized respeta parámetros que ya tenga la dirección', () => {
  expect(sized(`${url}?rect=0,0,10,10`, 640)).toBe(`${url}?rect=0,0,10,10&w=640&auto=format&fit=max&q=75`)
})

test('srcset no ofrece anchos mayores que el original', () => {
  expect(srcset(url, [320, 640, 1280, 1920], 1200)).toBe(
    `${sized(url, 320)} 320w, ${sized(url, 640)} 640w, ${sized(url, 1200)} 1200w`,
  )
})

test('srcset sin ancho original conocido ofrece todos los anchos', () => {
  expect(srcset(url, [320, 640], 0).split(', ')).toHaveLength(2)
})
