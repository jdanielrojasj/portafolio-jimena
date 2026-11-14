// @ts-check
import { defineConfig } from 'astro/config'

// Dirección pública de la web. En Cloudflare Pages se define SITE_URL
// (o se usa la que Cloudflare da a cada publicación).
const site = process.env.SITE_URL || process.env.CF_PAGES_URL || undefined

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
})
