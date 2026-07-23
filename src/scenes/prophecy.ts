import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { SYNOPSIS } from '../content'
import { edgeFade, sectionElement } from '../sceneKit'
import { BG, GOLD } from '../theme'

const RING_COUNT = 6

class MandalaLayer extends ThreeLayer {
  private readonly rings: THREE.Mesh[] = []

  constructor() {
    super('mandala')
    this.scrollRange = { start: 0.1, end: 0.36 }
    this.zIndex.value = 1
  }

  protected override onInit(): void {
    super.onInit()
    this.scene.fog = new THREE.Fog(BG, 4, 26)
    for (let index = 0; index < RING_COUNT; index += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1 + index, 0.02 + index * 0.008, 12, 120),
        new THREE.MeshStandardMaterial({
          color: GOLD,
          emissive: GOLD,
          emissiveIntensity: 0.4,
          metalness: 0.8,
          roughness: 0.3,
        }),
      )
      this.rings.push(ring)
      this.scene.add(ring)
    }
    this.scene.add(new THREE.AmbientLight(GOLD, 0.2))
    this.camera.position.z = 14
    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(this.camera.position, { z: 1.5, ease: 'power1.inOut', duration: 1 }),
    )
  }

  protected override onScroll(scroll: ScrollState): void {
    this.opacity.value = edgeFade(this.localProgress(scroll))
  }

  protected override onUpdate(deltaSeconds: number): void {
    this.rings.forEach((ring, index) => {
      ring.rotation.z += deltaSeconds * 0.06 * (index % 2 === 0 ? 1 : -1)
    })
  }
}

function createProphecyTextLayer(): HtmlLayer {
  const element = sectionElement(
    'prophecy',
    SYNOPSIS.map((line) => `<p class="prophecy-line">${line}</p>`).join(''),
  )
  const prophecy = new HtmlLayer('prophecy-text', element)
  prophecy.scrollRange = { start: 0.13, end: 0.34 }
  const lines = [...element.querySelectorAll('p')]
  const timeline = gsap.timeline({ paused: true })
  const slotWidth = 1 / lines.length
  lines.forEach((line, index) => {
    const slotStart = index * slotWidth
    timeline
      .fromTo(
        line,
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: slotWidth * 0.35, ease: 'power2.out' },
        slotStart,
      )
      .to(
        line,
        { autoAlpha: 0, y: -30, duration: slotWidth * 0.35, ease: 'power2.in' },
        slotStart + slotWidth * 0.6,
      )
  })
  prophecy.scrub(timeline)
  return prophecy
}

export function createProphecyLayers(): Layer[] {
  return [new MandalaLayer(), createProphecyTextLayer()]
}
