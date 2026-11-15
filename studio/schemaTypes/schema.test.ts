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

test('los tipos de vídeo tienen orden y los ajustes una foto para compartir', () => {
  const field = (type: string, name: string) => (byName(type) as any).fields.find((f: any) => f.name === name)
  expect(field('videoCategory', 'order')?.type).toBe('number')
  expect(field('siteSettings', 'shareImage')?.type).toBe('image')
})

test('existe el tipo opinión con el texto obligatorio y ayudas en español', () => {
  const type = byName('testimonial') as any
  expect(type).toBeDefined()
  const field = (n: string) => type.fields.find((f: any) => f.name === n)
  for (const n of ['quote', 'quoteLang', 'author', 'role', 'project', 'rating', 'source', 'sourceUrl', 'order'])
    expect(field(n), n).toBeDefined()
  for (const f of type.fields) expect(f.description, f.name).toBeTruthy()
  expect(field('quoteLang').initialValue).toBe('en')
})
