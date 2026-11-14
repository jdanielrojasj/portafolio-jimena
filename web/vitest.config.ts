import { defineConfig } from 'vitest/config'

// Las pruebas de navegador (e2e/) las ejecuta Playwright, no Vitest.
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
})
