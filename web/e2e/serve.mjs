// Construye la web con un archivo de contenido de prueba y la sirve
// como archivos estáticos, igual que hará Cloudflare Pages.
// Uso: node e2e/serve.mjs <archivo de prueba> <puerto>
import { spawnSync } from 'node:child_process'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const [fixture = 'site.raw.json', port = '4321'] = process.argv.slice(2)
const outDir = `dist-e2e/${fixture.replace(/\W+/g, '-')}`
const env = { ...process.env, USE_FIXTURES: '1', FIXTURE_FILE: fixture }

const build = spawnSync(`npx astro build --outDir ${outDir}`, { stdio: 'inherit', shell: true, env })
if (build.status !== 0) process.exit(build.status ?? 1)

const root = resolve(outDir)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  let file = join(root, path)
  if (!file.startsWith(root)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) return res.writeHead(404, { 'content-type': 'text/plain' }).end('404')
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(Number(port), '127.0.0.1', () => console.log(`${fixture} → http://127.0.0.1:${port}`))
