import {expect, test} from 'vitest'
import {schemaTypes} from './index'

const byName = (n: string) => schemaTypes.find((t) => t.name === n)!

test('existen los ocho tipos', () => {
  for (const n of [
    'localeString',
    'localeText',
    'videoCategory',
    'videoPiece',
    'actingWork',
    'brand',
    'service',
    'siteSettings',
  ])
    expect(byName(n), n).toBeDefined()
})

test('los interruptores empiezan apagados', () => {
  const f = (n: string) => (byName('siteSettings') as any).fields.find((x: any) => x.name === n)
  expect(f('showBrands').initialValue).toBe(false)
  expect(f('showCasting').initialValue).toBe(false)
})

test('cada campo de videoPiece tiene ayuda en español', () => {
  for (const field of (byName('videoPiece') as any).fields)
    expect(field.description, field.name).toBeTruthy()
})

test('todos los campos de todos los tipos tienen título', () => {
  for (const type of schemaTypes as any[])
    for (const field of type.fields ?? []) expect(field.title, `${type.name}.${field.name}`).toBeTruthy()
})
