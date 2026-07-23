import gsap from 'gsap'
import { HtmlLayer } from 'scroll-engine'
import { DEVANAGARI, TAGLINE, TITLE } from '../content'
import { sectionElement } from '../sceneKit'

export function createHeroLayer(): HtmlLayer {
  const element = sectionElement(
    'hero',
    `<span class="devanagari">${DEVANAGARI}</span>
     <h1>${TITLE}</h1>
     <div class="ornament"><span></span>✦<span></span></div>
     <p class="tagline">${TAGLINE}</p>
     <span class="scroll-hint">scroll</span>`,
  )
  const hero = new HtmlLayer('hero-title', element)
  hero.scrollRange = { start: 0.02, end: 0.16 }
  hero.scrub(
    gsap.timeline({ paused: true }).to(element, { autoAlpha: 0, y: -80, ease: 'power1.in', duration: 1 }),
  )

  const select = gsap.utils.selector(element)
  gsap
    .timeline({ delay: 0.2 })
    .from(select('.devanagari'), { autoAlpha: 0, y: -18, duration: 0.9, ease: 'power2.out' }, 0)
    .from(select('h1'), { autoAlpha: 0, letterSpacing: '0.34em', duration: 1.2, ease: 'power3.out' }, 0.15)
    .from(select('.ornament'), { autoAlpha: 0, scaleX: 0, duration: 0.8, ease: 'power2.out' }, 0.7)
    .from(select('.tagline'), { autoAlpha: 0, y: 16, duration: 0.8, ease: 'power2.out' }, 0.85)
    .from(select('.scroll-hint'), { autoAlpha: 0, duration: 0.7 }, 1.2)
  return hero
}
