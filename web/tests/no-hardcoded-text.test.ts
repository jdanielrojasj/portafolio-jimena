import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'

// Todo texto fijo de la interfaz pasa por t(): así la prueba de
// "todas las claves en los dos idiomas" lo cubre y añadir un idioma
// no obliga a buscar textos sueltos por los componentes.
test('ningún componente decide textos con locale === ...', () => {
  const dir = join(__dirname, '../src/components')
  const offenders = readdirSync(dir)
    .filter((f) => f.endsWith('.astro'))
    .filter((f) => /locale\s*===\s*['"](es|en)['"]\s*\?/.test(readFileSync(join(dir, f), 'utf8')))
  expect(offenders).toEqual([])
})
