import gsap from 'gsap'
import { HtmlLayer } from 'scroll-engine'
import { CAST } from '../content'
import { sectionElement } from '../sceneKit'

export function createCastLayer(): HtmlLayer {
  const cards = CAST.map(
    ({ actor, role }) => `<div class="cast-card"><h3>${actor}</h3><p>${role}</p></div>`,
  ).join('')
  const element = sectionElement('cast', `<h2>The Chosen</h2><div class="cast-grid">${cards}</div>`)
  const cast = new HtmlLayer('cast', element)
  cast.scrollRange = { start: 0.68, end: 0.86 }

  const timeline = gsap.timeline({ paused: true })
  timeline
    .fromTo(
      element.querySelector('h2'),
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      0.02,
    )
    .fromTo(
      element.querySelectorAll('.cast-card'),
      { autoAlpha: 0, y: 50 },
      { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.08, ease: 'power2.out' },
      0.08,
    )
    .to(element, { autoAlpha: 0, y: -40, duration: 0.25, ease: 'power2.in' }, 0.75)
  cast.scrub(timeline)
  return cast
}
