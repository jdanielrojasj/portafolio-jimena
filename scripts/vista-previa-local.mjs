// Prepara una vista previa de la web con el material real de material/, sin Sanity.
// Las fotos se reducen a 1600 px y los vídeos se enlazan (no ocupan espacio extra).
// Todo lo generado está fuera de git: web/public/local/ y fixtures/site.raw.local.json.
//
// Uso (desde la raíz):  node scripts/vista-previa-local.mjs
// Después:              cd web; $env:USE_FIXTURES='1'; $env:FIXTURE_FILE='site.raw.local.json'; npm run dev
import { execFileSync } from 'node:child_process'
import { existsSync, linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const raiz = resolve(import.meta.dirname, '..')
const material = join(raiz, 'material')
const salida = join(raiz, 'web', 'public', 'local')
const fixtures = join(raiz, 'web', 'src', 'lib', 'fixtures')

rmSync(salida, { recursive: true, force: true })
mkdirSync(salida, { recursive: true })

let n = 0
/** Copia reducida de una foto; devuelve la imagen con su tamaño real. */
function foto(ruta) {
  const destino = `foto-${++n}.jpg`
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(material, ruta),
    '-vf', "scale='if(gt(iw,ih),min(1600,iw),-2)':'if(gt(iw,ih),-2,min(1600,ih))'",
    '-q:v', '3', join(salida, destino)])
  const [width, height] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', join(salida, destino)])
    .toString().trim().split(',').map(Number)
  return { url: `/local/${destino}`, width, height }
}

/** Enlace al vídeo comprimido de material/web. */
function video(nombre) {
  const origen = join(material, 'web', nombre)
  if (!existsSync(origen)) throw new Error(`Falta el vídeo comprimido: material/web/${nombre}`)
  if (!existsSync(join(salida, nombre))) linkSync(origen, join(salida, nombre))
  return `/local/${nombre}`
}

const base = JSON.parse(readFileSync(join(fixtures, 'site.raw.json'), 'utf8'))
const ejemplo = (es, en) => ({ es, en })

const site = {
  ...base,
  settings: {
    ...base.settings,
    heroPhotos: [foto('fotos/usar--portada-1--sonriendo.jpg'), foto('fotos/usar--portada-2--brazos-cruzados.jpg')],
    heroVideoUrl: video('ugc-testimonial-video.mp4'),
    aboutPhoto: foto('fotos/usar--presentacion--primer-plano-bn-editada.jpg'),
    shareImage: foto('fotos/usar--compartir--sonrisa-horizontal.jpg'),
    showBrands: true,
  },
  categories: [
    { slug: 'review', title: ejemplo('Reseña', 'Review') },
    { slug: 'testimonial', title: ejemplo('Testimonio', 'Testimonial') },
    { slug: 'demo', title: ejemplo('Demostración', 'Product demo') },
  ],
  videos: [
    { _id: 'vichy', title: ejemplo('Reel para Vichy', 'Reel for Vichy'), category: 'review', brand: 'Vichy',
      videoUrl: video('reel-vichy.mp4'), poster: null, description: null, featured: true, order: 1 },
    { _id: 'enovo', title: ejemplo('Testimonio para Enovo', 'Testimonial for Enovo'), category: 'testimonial', brand: 'Enovo',
      videoUrl: video('testimonial-enovo.mp4'), poster: null, description: null, featured: false, order: 2 },
    { _id: 'workvivo', title: ejemplo('Testimonio en portugués para Workvivo', 'Portuguese testimonial for Workvivo'),
      category: 'testimonial', brand: 'Workvivo',
      videoUrl: video('portugues-testimonial-workvivo.mp4'), poster: null, description: null, featured: false, order: 3 },
    { _id: 'ugc', title: ejemplo('Testimonio UGC', 'UGC testimonial'), category: 'testimonial', brand: null,
      videoUrl: video('ugc-testimonial-video.mp4'), poster: null, description: null, featured: false, order: 4 },
    { _id: 'perricolas', title: ejemplo('Demostración para Perricolas', 'Product demo for Perricolas'), category: 'demo',
      brand: 'Perricolas', videoUrl: video('78e7f2c27d196dabcc8a7ced09265315.mp4'), poster: null, description: null,
      featured: false, order: 5 },
  ],
  brands: ['Vichy', 'Enovo', 'Workvivo', 'Perricolas'].map((name) => ({ name, logoUrl: null })),
  actingWorks: [
    { _id: 'lobo', title: 'Lobo, ¿qué estás haciendo?', kind: 'teatro', role: null, year: 2025, company: null,
      description: null, videoUrl: null,
      photos: ['usar--jimena-en-el-escenario.jpg', 'usar--en-funcion.jpg', 'usar--elenco-completo.jpg']
        .map((f) => foto(`teatro/2025-lobo-que-estas-haciendo/${f}`)) },
    { _id: 'sentimental', title: 'Sentimental', kind: 'cortometraje', role: null, year: 2024, company: null,
      description: null, videoUrl: video('sentimental.mp4'),
      photos: [foto('personales/sentimental/usar--equipo-de-rodaje.jpg')] },
    { _id: 'taller', title: 'Taller de actuación frente a cámara', kind: 'taller', role: null, year: 2020, company: null,
      description: null, videoUrl: video('003.mp4'), photos: null },
    { _id: 'macbeth', title: 'Macbeth', kind: 'teatro', role: null, year: 2018, company: null, description: null,
      videoUrl: null,
      photos: ['usar--escena-primer-plano.png', 'usar--escena-trio.jpg', 'usar--escena-dos.png',
        'usar--escena-vestuario-verde.png', 'usar--escena-abrazo.png'].map((f) => foto(`teatro/2018-macbeth/${f}`)) },
    { _id: 'musical', title: 'Teatro musical: Chicago y El Rey León', kind: 'teatro', role: null, year: 2015,
      company: null, description: null, videoUrl: null,
      photos: ['editar--chicago.jpg', 'editar--rey-leon.jpg', 'editar--rey-leon-2.jpg']
        .map((f) => foto(`teatro/2015-teatro Musical/${f}`)) },
    { _id: 'borderline', title: 'Borderline', kind: 'teatro', role: null, year: 2015, company: null,
      description: null, videoUrl: null, photos: [foto('teatro/2015-borderline/editar--cartel.jpg')] },
    { _id: 'virgenes', title: 'Vírgenes suicidas', kind: 'teatro', role: null, year: 2014, company: null,
      description: null, videoUrl: null,
      photos: ['editar--escena-grito.jpg', 'editar--escena-sentada.jpg', 'editar--escena-grupo.jpg']
        .map((f) => foto(`teatro/2014-virgenes-suicidas/${f}`)) },
  ],
}

writeFileSync(join(fixtures, 'site.raw.local.json'), JSON.stringify(site, null, 2) + '\n')
console.log(`Vista previa lista: ${n} fotos y los vídeos en web/public/local/`)
