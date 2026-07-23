import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { edgeFade, fadeThroughTimeline, sectionElement } from '../sceneKit'
import { BG, EMBER, SAFFRON } from '../theme'

const TIER_COUNT = 8
const DIYA_COUNT = 24

class TempleLayer extends ThreeLayer {
  private temple!: THREE.Group
  private readonly diyas: THREE.Mesh[] = []

  constructor() {
    super('temple')
    this.scrollRange = { start: 0.51, end: 0.71 }
    this.zIndex.value = 3
  }

  protected override onInit(): void {
    super.onInit()
    this.scene.fog = new THREE.Fog(BG, 6, 30)
    const silhouette = new THREE.MeshStandardMaterial({ color: 0x0d0508, roughness: 1 })
    this.temple = new THREE.Group()
    for (let tier = 0; tier < TIER_COUNT; tier += 1) {
      const width = 6 - tier * 0.6
      const block = new THREE.Mesh(new THREE.BoxGeometry(width, 0.55, width * 0.7), silhouette)
      block.position.y = -1.5 + tier * 0.55
      this.temple.add(block)
    }
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 4), silhouette)
    crown.position.y = -1.5 + (TIER_COUNT - 1) * 0.55 + 0.275 + 0.45
    this.temple.add(crown)
    this.temple.position.y = -2

    const duskGlow = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshBasicMaterial({ color: SAFFRON, transparent: true, opacity: 0.22 }),
    )
    duskGlow.position.set(0, -1, -8)
    const horizonLight = new THREE.PointLight(SAFFRON, 60, 40)
    horizonLight.position.set(0, 0, -6)

    const diyaMaterial = new THREE.MeshBasicMaterial({
      color: EMBER,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
    for (let index = 0; index < DIYA_COUNT; index += 1) {
      const diya = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), diyaMaterial)
      diya.position.set((Math.random() - 0.5) * 10, -1 + Math.random() * 3, (Math.random() - 0.5) * 4 + 1)
      this.diyas.push(diya)
      this.scene.add(diya)
    }

    this.scene.add(this.temple, duskGlow, horizonLight, new THREE.AmbientLight(SAFFRON, 0.1))
    this.camera.position.set(0, 0.6, 10)

    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(this.camera.position, { z: 6.5, y: 1.6, ease: 'power1.inOut', duration: 1 }, 0)
        .to(this.temple.position, { y: 0, ease: 'power2.out', duration: 0.6 }, 0),
    )
  }

  protected override onScroll(scroll: ScrollState): void {
    this.opacity.value = edgeFade(this.localProgress(scroll))
  }

  protected override onUpdate(deltaSeconds: number): void {
    for (const [index, diya] of this.diyas.entries()) {
      diya.position.y += deltaSeconds * (0.12 + (index % 4) * 0.05)
      if (diya.position.y > 3) diya.position.y = -1
    }
  }
}

function createTempleCaption(): HtmlLayer {
  const element = sectionElement(
    'caption caption-right',
    `<h2>The Last Temple</h2>
     <p>A thousand diyas burn for a god who stopped listening. Tonight, one of them will answer.</p>`,
  )
  const caption = new HtmlLayer('temple-caption', element)
  caption.scrollRange = { start: 0.54, end: 0.7 }
  caption.scrub(fadeThroughTimeline(element))
  return caption
}

export function createTempleLayers(): Layer[] {
  return [new TempleLayer(), createTempleCaption()]
}
