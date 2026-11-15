// @ts-check
import { defineConfig } from 'astro/config'
import { resolveSite } from './site-url.mjs'

const site = resolveSite(process.env)

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
})
