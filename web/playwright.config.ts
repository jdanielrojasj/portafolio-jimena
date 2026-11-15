import { defineConfig, devices } from '@playwright/test'

// Cada variante de contenido de prueba se construye y se sirve en su puerto.
const SITES = {
  base: { fixture: 'site.raw.json', port: 4331 },
  togglesOn: { fixture: 'site.raw.toggles-on.json', port: 4332 },
  empty: { fixture: 'site.raw.empty.json', port: 4333 },
}

const url = (site: keyof typeof SITES) => `http://127.0.0.1:${SITES[site].port}`
const mobile = { ...devices['Pixel 7'] }
const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
const VARIANT_SPECS = /\.(toggles-on|empty)\.spec\.ts$/

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list']],
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'movil', testIgnore: VARIANT_SPECS, use: { ...mobile, baseURL: url('base') } },
    { name: 'escritorio', testIgnore: VARIANT_SPECS, use: { ...desktop, baseURL: url('base') } },
    { name: 'toggles-on', testMatch: /\.toggles-on\.spec\.ts$/, use: { ...mobile, baseURL: url('togglesOn') } },
    { name: 'empty', testMatch: /\.empty\.spec\.ts$/, use: { ...mobile, baseURL: url('empty') } },
  ],
  webServer: Object.values(SITES).map(({ fixture, port }) => ({
    command: `node e2e/serve.mjs ${fixture} ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 180_000,
  })),
})
