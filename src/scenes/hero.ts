import gsap from 'gsap'
import { HtmlLayer } from 'scroll-engine'
import { DEVANAGARI, TAGLINE, TITLE } from '../content'
import { sectionElement } from '../sceneKit'

export function createHeroLayer(): HtmlLayer {
  const element = sectionElement(
    'hero',
    `<span class="devanagari">${DEVANAGARI}</span>
     <h1>${TITLE}</h1>
     <p class="tagline">${TAGLINE}</p>
     <span class="scroll-hint">scroll</span>`,
  )
  const hero = new HtmlLayer('hero-title', element)
  hero.scrollRange = { start: 0.02, end: 0.16 }
  hero.scrub(
    gsap.timeline({ paused: true }).to(element, { autoAlpha: 0, y: -80, ease: 'power1.in', duration: 1 }),
  )
  return hero
}
