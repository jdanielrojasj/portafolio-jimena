// Reproductor a pantalla completa. Cualquier elemento con
// data-lightbox-video (o data-lightbox-image) lo abre al pulsarlo.
const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]')

if (dialog) {
  const stage = dialog.querySelector<HTMLElement>('[data-lightbox-stage]')!
  const video = dialog.querySelector<HTMLVideoElement>('[data-lightbox-video-el]')!
  const title = dialog.querySelector<HTMLElement>('[data-lightbox-title-el]')!
  let image: HTMLImageElement | null = null
  let opener: HTMLElement | null = null

  const pauseBackground = (paused: boolean) => {
    // Mientras el reproductor está abierto no suena ni se mueve nada más.
    const hero = document.querySelector<HTMLVideoElement>('[data-hero-video]')
    if (!hero) return
    if (paused) {
      hero.pause()
      return
    }
    // Si la visita pausó el movimiento o lo pide reducido, sigue quieto.
    const stopped =
      document.documentElement.dataset.motion === 'paused' || matchMedia('(prefers-reduced-motion: reduce)').matches
    if (stopped) return
    hero.dataset.resumed = 'true'
    void hero.play().catch(() => {})
  }

  const open = (trigger: HTMLElement) => {
    opener = trigger
    title.textContent = trigger.dataset.lightboxTitle ?? ''

    const videoUrl = trigger.dataset.lightboxVideo
    const imageUrl = trigger.dataset.lightboxImage
    video.hidden = !videoUrl

    if (videoUrl) {
      video.muted = false
      video.src = videoUrl
    } else if (imageUrl) {
      image = new Image()
      image.src = imageUrl
      image.alt = trigger.dataset.lightboxAlt ?? ''
      stage.append(image)
    }

    pauseBackground(true)
    dialog.showModal()
    if (videoUrl) void video.play().catch(() => {})
  }

  // Al cerrar (botón, Escape o tocar fuera) se detiene y se libera el vídeo.
  dialog.addEventListener('close', () => {
    video.pause()
    video.removeAttribute('src')
    video.load()
    image?.remove()
    image = null
    pauseBackground(false)
    opener?.focus()
    opener = null
  })

  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const outside = target === dialog || target.classList.contains('inner') || target === stage
    if (outside || target.closest('[data-lightbox-close]')) dialog.close()
  })

  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-lightbox-video], [data-lightbox-image]')
    if (trigger) open(trigger)
  })
}
