import { expect, test } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, UI_KEYS, localePath, pick, pickLang, t } from '../src/lib/i18n'

test('el idioma por defecto es el español', () => {
  expect(DEFAULT_LOCALE).toBe('es')
  expect(LOCALES).toEqual(['es', 'en'])
})

test('pick devuelve el idioma pedido', () => {
  expect(pick({ es: 'Hola', en: 'Hi' }, 'en')).toBe('Hi')
  expect(pick({ es: 'Hola', en: 'Hi' }, 'es')).toBe('Hola')
})

test('pick cae al español si falta el inglés', () => {
  expect(pick({ es: 'Hola' }, 'en')).toBe('Hola')
})

test('pick cae al español si el inglés está vacío o en blanco', () => {
  expect(pick({ es: 'Hola', en: '  ' }, 'en')).toBe('Hola')
  expect(pick({ es: 'Hola', en: '' }, 'en')).toBe('Hola')
})

test('pick devuelve cadena vacía sin datos', () => {
  expect(pick(undefined, 'es')).toBe('')
  expect(pick(null, 'en')).toBe('')
  expect(pick({}, 'en')).toBe('')
})

test('pick recorta los espacios sobrantes', () => {
  expect(pick({ es: '  Hola  ' }, 'es')).toBe('Hola')
})

test('localePath', () => {
  expect(localePath('es')).toBe('/')
  expect(localePath('en')).toBe('/en/')
  expect(localePath('es', 'contacto')).toBe('/#contacto')
  expect(localePath('en', 'contacto')).toBe('/en/#contacto')
})

test('t tiene todas las claves en los dos idiomas', () => {
  for (const locale of LOCALES)
    for (const key of UI_KEYS) expect(t(locale, key), `${locale}:${key}`).not.toBe('')
})

test('el botón principal dice lo acordado', () => {
  expect(t('es', 'cta.work')).toBe('Trabajemos juntas')
  expect(t('en', 'cta.work')).toBe("Let's work together")
})

test('pickLang marca el texto que cae al español', () => {
  expect(pickLang({ es: 'Hola' }, 'en')).toEqual({ text: 'Hola', lang: 'es' })
  expect(pickLang({ es: 'Hola', en: 'Hi' }, 'en')).toEqual({ text: 'Hi', lang: undefined })
  expect(pickLang({ es: 'Hola' }, 'es')).toEqual({ text: 'Hola', lang: undefined })
  expect(pickLang(undefined, 'en')).toEqual({ text: '', lang: undefined })
})
