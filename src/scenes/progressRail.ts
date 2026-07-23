import { HtmlLayer, type ReadonlyProp } from 'scroll-engine'

const CHAPTERS = [
  { at: 0, label: 'त्रिनेत्र' },
  { at: 0.13, label: 'The Prophecy' },
  { at: 0.36, label: 'The Weapon' },
  { at: 0.54, label: 'The Temple' },
  { at: 0.7, label: 'The Chosen' },
  { at: 0.88, label: 'The Awakening' },
]

export function createProgressRail(scrollProgress: ReadonlyProp<number>): HtmlLayer {
  const element = document.createElement('nav')
  element.className = 'progress-rail'
  element.innerHTML = `
    <div class="rail-track"><div class="rail-fill"></div></div>
    ${CHAPTERS.map(
      ({ at, label }) => `<span class="rail-marker" style="top: ${at * 100}%" title="${label}"></span>`,
    ).join('')}
  `
  const rail = new HtmlLayer('progress-rail', element)
  const fill = element.querySelector<HTMLElement>('.rail-fill')
  const markers = [...element.querySelectorAll<HTMLElement>('.rail-marker')]
  rail.bind(scrollProgress, (value) => {
    if (fill) fill.style.transform = `scaleY(${value})`
    markers.forEach((marker, index) => {
      marker.classList.toggle('active', value >= (CHAPTERS[index]?.at ?? 0))
    })
  })
  return rail
}
