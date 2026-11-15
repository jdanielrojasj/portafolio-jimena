import { expect, test } from 'vitest'
import { resolveSite } from '../site-url.mjs'

test('usa SITE_URL cuando existe', () => {
  expect(resolveSite({ SITE_URL: 'https://jimena.example', CF_PAGES_BRANCH: 'main' })).toBe('https://jimena.example')
})

test('en una vista previa de Cloudflare usa la dirección de esa publicación', () => {
  expect(resolveSite({ CF_PAGES_BRANCH: 'prueba', CF_PAGES_URL: 'https://abc.x.pages.dev' })).toBe('https://abc.x.pages.dev')
})

test('la publicación principal sin SITE_URL se detiene con un error claro', () => {
  expect(() => resolveSite({ CF_PAGES_BRANCH: 'main', CF_PAGES_URL: 'https://abc.x.pages.dev' })).toThrow(/SITE_URL/)
})

test('en el ordenador no hace falta dirección', () => {
  expect(resolveSite({})).toBeUndefined()
})
