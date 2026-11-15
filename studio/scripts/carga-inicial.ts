// Carga inicial del material de Jimena en Sanity (fotos marcadas "usar" y vídeos de material/web).
// Usa identificadores fijos: si se repite, reemplaza los documentos en vez de duplicarlos,
// y Sanity no vuelve a guardar un archivo idéntico que ya tenga.
//
// Uso (desde studio/):  npx sanity exec scripts/carga-inicial.ts --with-user-token
import {createReadStream, existsSync} from 'node:fs'
import {basename, join, resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const material = resolve(process.cwd(), '..', 'material')

type Ref = {_type: 'reference'; _ref: string}
const ref = (id: string): Ref => ({_type: 'reference', _ref: id})
const ls = (es: string, en?: string) => ({_type: 'localeString', es, ...(en ? {en} : {})})

async function subir(kind: 'image' | 'file', ruta: string) {
  const completa = join(material, ruta)
  if (!existsSync(completa)) throw new Error(`No existe: material/${ruta}`)
  const asset = await client.assets.upload(kind, createReadStream(completa), {filename: basename(ruta)})
  console.log(`  subido ${ruta}`)
  return asset._id
}
const imagen = async (ruta: string) => ({_type: 'image', asset: ref(await subir('image', ruta))})
const imagenes = async (rutas: string[]) => {
  const out = []
  for (const [i, r] of rutas.entries()) out.push({...(await imagen(r)), _key: `foto${i + 1}`})
  return out
}
const archivo = async (ruta: string) => ({_type: 'file', asset: ref(await subir('file', ruta))})

async function main() {
  // Tipos de vídeo. "Testimonio" ya existe (creado desde el panel): se reutiliza.
  const testimonio = await client.fetch<string | null>(
    `*[_type == "videoCategory" && slug.current == "testimonio" && !(_id in path("drafts.**"))][0]._id`,
  )
  if (!testimonio) throw new Error('No encuentro el tipo "Testimonio" publicado.')
  const tipos = [
    {_id: 'tipo-resena', title: ls('Reseña', 'Review'), slug: 'resena', order: 1},
    {_id: 'tipo-demostracion', title: ls('Demostración', 'Product demo'), slug: 'demostracion', order: 3},
  ]
  for (const t of tipos) {
    await client.createOrReplace({...t, _type: 'videoCategory', slug: {_type: 'slug', current: t.slug}})
  }
  await client.patch(testimonio).set({order: 2}).commit()
  console.log('Tipos de vídeo listos')

  // Marcas.
  const marcas = ['Vichy', 'Enovo', 'Workvivo', 'Perricolas']
  for (const m of marcas) await client.createOrReplace({_id: `marca-${m.toLowerCase()}`, _type: 'brand', name: m})
  console.log('Marcas listas')

  // Vídeos para marcas.
  const videos = [
    {id: 'vichy', es: 'Reel para Vichy', en: 'Reel for Vichy', tipo: 'tipo-resena', marca: 'vichy', f: 'reel-vichy.mp4', featured: true},
    {id: 'enovo', es: 'Testimonio para Enovo', en: 'Testimonial for Enovo', tipo: testimonio, marca: 'enovo', f: 'testimonial-enovo.mp4'},
    {id: 'workvivo', es: 'Testimonio en portugués para Workvivo', en: 'Portuguese testimonial for Workvivo', tipo: testimonio, marca: 'workvivo', f: 'portugues-testimonial-workvivo.mp4'},
    {id: 'ugc', es: 'Testimonio UGC', en: 'UGC testimonial', tipo: testimonio, f: 'ugc-testimonial-video.mp4'},
    {id: 'perricolas', es: 'Demostración para Perricolas', en: 'Product demo for Perricolas', tipo: 'tipo-demostracion', marca: 'perricolas', f: '78e7f2c27d196dabcc8a7ced09265315.mp4'},
  ]
  for (const [i, v] of videos.entries()) {
    console.log(`Vídeo: ${v.es}`)
    await client.createOrReplace({
      _id: `video-${v.id}`,
      _type: 'videoPiece',
      title: ls(v.es, v.en),
      category: ref(v.tipo),
      ...(v.marca ? {brand: ref(`marca-${v.marca}`)} : {}),
      video: await archivo(`web/${v.f}`),
      featured: v.featured ?? false,
      order: i + 1,
    })
  }

  // Trabajos como actriz. Sin personaje, compañía ni descripción: los completa Jimena.
  const obras: {id: string; title: string; kind: string; year: number; fotos?: string[]; video?: string}[] = [
    {id: 'lobo', title: 'Lobo, ¿qué estás haciendo?', kind: 'teatro', year: 2025,
      fotos: ['usar--jimena-en-el-escenario.jpg', 'usar--en-funcion.jpg', 'usar--elenco-completo.jpg'].map((f) => `teatro/2025-lobo-que-estas-haciendo/${f}`)},
    {id: 'sentimental', title: 'Sentimental', kind: 'cortometraje', year: 2024,
      fotos: ['personales/sentimental/usar--equipo-de-rodaje.jpg'], video: 'web/sentimental.mp4'},
    {id: 'taller-camara', title: 'Taller de actuación frente a cámara', kind: 'taller', year: 2020, video: 'web/003.mp4'},
    {id: 'macbeth', title: 'Macbeth', kind: 'teatro', year: 2018,
      fotos: ['usar--escena-primer-plano.png', 'usar--escena-trio.jpg', 'usar--escena-dos.png', 'usar--escena-vestuario-verde.png', 'usar--escena-abrazo.png'].map((f) => `teatro/2018-macbeth/${f}`)},
    {id: 'teatro-musical', title: 'Teatro musical: Chicago y El Rey León', kind: 'teatro', year: 2015,
      fotos: ['editar--chicago.jpg', 'editar--rey-leon.jpg', 'editar--rey-leon-2.jpg'].map((f) => `teatro/2015-teatro Musical/${f}`)},
    {id: 'borderline', title: 'Borderline', kind: 'teatro', year: 2015, fotos: ['teatro/2015-borderline/editar--cartel.jpg']},
    {id: 'virgenes-suicidas', title: 'Vírgenes suicidas', kind: 'teatro', year: 2014,
      fotos: ['editar--escena-grito.jpg', 'editar--escena-sentada.jpg', 'editar--escena-grupo.jpg'].map((f) => `teatro/2014-virgenes-suicidas/${f}`)},
  ]
  for (const o of obras) {
    console.log(`Obra: ${o.title}`)
    await client.createOrReplace({
      _id: `obra-${o.id}`,
      _type: 'actingWork',
      title: o.title,
      kind: o.kind,
      year: o.year,
      ...(o.fotos ? {photos: await imagenes(o.fotos)} : {}),
      ...(o.video ? {video: await archivo(o.video)} : {}),
    })
  }

  // Ajustes de la web. Se conserva lo que ya se haya escrito en el panel (contacto, textos…).
  console.log('Ajustes de la web')
  const {_rev, _createdAt, _updatedAt, ...actuales} = ((await client.getDocument('siteSettings')) ?? {}) as Record<string, unknown>
  await client.createOrReplace({
    ...actuales,
    _id: 'siteSettings',
    _type: 'siteSettings',
    tagline: (actuales as any).tagline ?? ls('Actriz y creadora de contenido UGC', 'Actress & UGC creator'),
    marqueeWords: (actuales as any).marqueeWords ?? [
      {...ls('UGC'), _key: 'p1'},
      {...ls('Teatro', 'Theatre'), _key: 'p2'},
      {...ls('Reseñas', 'Reviews'), _key: 'p3'},
      {...ls('Testimonios', 'Testimonials'), _key: 'p4'},
    ],
    heroPhotos: await imagenes(['fotos/usar--portada-1--sonriendo.jpg', 'fotos/usar--portada-2--brazos-cruzados.jpg']),
    heroVideo: await archivo('web/portada-provisional.mp4'),
    shareImage: await imagen('fotos/usar--compartir--sonrisa-horizontal.jpg'),
    aboutPhoto: await imagen('fotos/usar--presentacion--primer-plano-bn-editada.jpg'),
    showBrands: true,
  })
  console.log('Carga terminada.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
