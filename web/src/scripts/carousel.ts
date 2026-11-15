// Filtros por tipo de vídeo: ocultan las tarjetas que no coinciden.
const group = document.querySelector<HTMLElement>('[data-filters]')
const rail = document.querySelector<HTMLElement>('[data-carousel]')

if (group && rail) {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-filter]')]
  const items = [...rail.querySelectorAll<HTMLElement>('[data-video-item]')]

  group.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]')
    if (!button) return
    const wanted = button.dataset.filter ?? ''

    for (const b of buttons) b.setAttribute('aria-pressed', String(b === button))
    for (const item of items) item.hidden = wanted !== '' && item.dataset.category !== wanted

    rail.scrollTo({ left: 0 })
  })
}
