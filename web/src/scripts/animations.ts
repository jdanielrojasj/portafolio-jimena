import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Quien pide al sistema "reducir movimiento" ve la página completa y
// quieta: no se inicia ninguna animación ni el vídeo de la portada.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reduced) {
  gsap.registerPlugin(ScrollTrigger)

  const heroVideo = document.querySelector<HTMLVideoElement>('[data-hero-video]')
  if (heroVideo) {
    heroVideo.dataset.autoplayed = 'true'
    void heroVideo.play().catch(() => {})
  }

  // ---------- Entrada de la portada ----------
  const nameLines = gsap.utils.toArray<HTMLElement>('[data-hero-name] .line > span')
  const intro = document.querySelector<HTMLElement>('[data-hero-intro]')
  const pieces = gsap.utils.toArray<HTMLElement>('[data-hero-piece]')

  const enter = gsap.timeline({ defaults: { ease: 'expo.out' } })
  if (nameLines.length) enter.from(nameLines, { yPercent: 110, duration: 1.1, stagger: 0.09 })
  if (intro) enter.from(intro, { opacity: 0, y: 16, duration: 0.7 }, 0.35)
  if (pieces.length) {
    enter.from(
      pieces,
      { opacity: 0, y: 48, scale: 0.96, duration: 1, stagger: 0.1, clearProps: 'opacity,scale' },
      0.3,
    )
  }

  // ---------- Las piezas de la portada se separan al bajar ----------
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  if (hero) {
    enter.eventCallback('onComplete', () => {
      for (const piece of pieces) {
        gsap.fromTo(
          piece,
          { y: 0 },
          {
            y: () => Number(piece.dataset.speed ?? 0) * window.innerHeight,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4, invalidateOnRefresh: true },
          },
        )
      }
      ScrollTrigger.refresh()
    })
  }

  // ---------- Cada sección aparece al entrar en pantalla ----------
  for (const section of gsap.utils.toArray<HTMLElement>('[data-reveal]')) {
    const items = [...section.children] as HTMLElement[]
    // El estado oculto se pone desde aquí y no desde CSS: sin
    // JavaScript, todo el contenido queda a la vista. Solo se toca la
    // opacidad (no la visibilidad) para que el teclado y los lectores
    // de pantalla alcancen los controles antes de que aparezcan.
    gsap.set(items, { opacity: 0, y: 24 })
    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(items, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' }),
    })
  }

  // ---------- El bloque oscuro entra como un telón ----------
  const dark = document.querySelector<HTMLElement>('[data-dark]')
  if (dark) {
    gsap.fromTo(
      dark,
      { borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' },
      {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        ease: 'none',
        scrollTrigger: { trigger: dark, start: 'top 90%', end: 'top 20%', scrub: true },
      },
    )
  }

  // Las tipografías y las fotos cambian las alturas al terminar de cargar.
  window.addEventListener('load', () => ScrollTrigger.refresh())
  void document.fonts?.ready.then(() => ScrollTrigger.refresh())
}
