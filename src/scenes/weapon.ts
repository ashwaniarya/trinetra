import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { edgeFade, fadeThroughTimeline, goldMaterial, sectionElement } from '../sceneKit'
import { BG, EMBER, GOLD, SAFFRON } from '../theme'

class TrishulLayer extends ThreeLayer {
  private trishul!: THREE.Group
  private elapsedSeconds = 0

  constructor() {
    super('trishul')
    this.scrollRange = { start: 0.33, end: 0.53 }
    this.zIndex.value = 2
  }

  protected override onInit(): void {
    super.onInit()
    this.scene.fog = new THREE.Fog(BG, 4, 22)
    const material = goldMaterial()
    this.trishul = new THREE.Group()

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 7, 16), material)
    const crossguard = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 12, 40), material)
    crossguard.position.y = 3.2
    crossguard.rotation.x = Math.PI / 2
    const centerProng = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.6, 16), material)
    centerProng.position.y = 4.3

    const prongArc = new THREE.TorusGeometry(0.7, 0.055, 12, 40, Math.PI)
    const arc = new THREE.Mesh(prongArc, material)
    arc.position.y = 3.5
    for (const side of [-1, 1]) {
      const sideProng = new THREE.Mesh(new THREE.ConeGeometry(0.11, 1.1, 16), material)
      sideProng.position.set(side * 0.7, 4.1, 0)
      this.trishul.add(sideProng)
    }
    this.trishul.add(shaft, crossguard, centerProng, arc)
    this.trishul.position.y = -7

    const rimLight = new THREE.DirectionalLight(GOLD, 3)
    rimLight.position.set(0, 3, -5)
    const keyLight = new THREE.DirectionalLight(SAFFRON, 0.8)
    keyLight.position.set(3, 2, 4)
    this.scene.add(this.trishul, rimLight, keyLight, new THREE.AmbientLight(EMBER, 0.15))
    this.camera.position.set(0, 1.2, 12)

    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(this.trishul.position, { y: 0, ease: 'power2.out', duration: 0.6 }, 0)
        .to(this.trishul.rotation, { y: Math.PI * 0.5, ease: 'none', duration: 1 }, 0)
        .to(this.camera.position, { z: 9, y: 2.4, ease: 'power1.inOut', duration: 1 }, 0),
    )
  }

  protected override onScroll(scroll: ScrollState): void {
    this.opacity.value = edgeFade(this.localProgress(scroll))
  }

  protected override onUpdate(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds
    this.trishul.rotation.z = Math.sin(this.elapsedSeconds * 0.8) * 0.02
  }
}

function createWeaponCaption(): HtmlLayer {
  const element = sectionElement(
    'caption caption-left',
    `<h2>The Weapon</h2>
     <p>Forged from the first flame and cooled in the last river, the trishul chooses its bearer — and unmakes him.</p>`,
  )
  const caption = new HtmlLayer('weapon-caption', element)
  caption.scrollRange = { start: 0.36, end: 0.52 }
  caption.scrub(fadeThroughTimeline(element))
  return caption
}

export function createWeaponLayers(): Layer[] {
  return [new TrishulLayer(), createWeaponCaption()]
}
