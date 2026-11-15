import {expect, test} from 'vitest'
import {singletonActions} from './structure'

const all = ['publish', 'discardChanges', 'unpublish', 'duplicate', 'delete', 'restore'].map((action) => ({action}))

test('la ficha de ajustes no se puede despublicar, duplicar ni borrar', () => {
  expect(singletonActions(all as any, 'siteSettings').map((a: any) => a.action)).toEqual([
    'publish',
    'discardChanges',
    'restore',
  ])
})

test('los demás tipos conservan todas sus acciones', () => {
  expect(singletonActions(all as any, 'videoPiece')).toHaveLength(6)
})
