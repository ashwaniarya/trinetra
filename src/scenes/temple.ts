import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { EdgeFadedShaderLayer, edgeFade, fadeThroughTimeline, sectionElement } from '../sceneKit'
import { GOD_RAYS_FRAGMENT } from '../shaders/godRays'
import { BG, EMBER, SAFFRON } from '../theme'

const TIER_COUNT = 8
const DIYA_COUNT = 24

class TempleLayer extends ThreeLayer {
  private temple!: THREE.Group
  private readonly diyas: THREE.Mesh[] = []
  private elapsedSeconds = 0

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
    const crownBaseY = -1.5 + (TIER_COUNT - 1) * 0.55 + 0.275
    crown.position.y = crownBaseY + 0.45
    this.temple.add(crown)

    const kalashMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9a441,
      emissive: 0xd9a441,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.35,
    })
    const kalashBase = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), kalashMaterial)
    kalashBase.position.y = crownBaseY + 0.98
    const kalashNeck = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), kalashMaterial)
    kalashNeck.position.y = crownBaseY + 1.13
    const kalashTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 8), kalashMaterial)
    kalashTip.position.y = crownBaseY + 1.26
    this.temple.add(kalashBase, kalashNeck, kalashTip)

    const colonnade = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.08, 0.1, 1.1, 8),
      silhouette,
      14,
    )
    const columnPlacement = new THREE.Object3D()
    for (let column = 0; column < 14; column += 1) {
      columnPlacement.position.set(-2.8 + column * (5.6 / 13), -1.22, 2.2)
      columnPlacement.updateMatrix()
      colonnade.setMatrixAt(column, columnPlacement.matrix)
    }
    colonnade.instanceMatrix.needsUpdate = true
    this.temple.add(colonnade)

    const doorway = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.9),
      new THREE.MeshBasicMaterial({
        color: SAFFRON,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    doorway.position.set(0, -1.3, 2.11)
    this.temple.add(doorway)

    for (const [stepIndex, stepWidth] of [3.4, 4.0, 4.6].entries()) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(stepWidth, 0.12, 0.5), silhouette)
      step.position.set(0, -1.85 - stepIndex * 0.12, 2.35 + stepIndex * 0.25)
      this.temple.add(step)
    }
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
    this.elapsedSeconds += deltaSeconds
    for (const [index, diya] of this.diyas.entries()) {
      diya.position.y += deltaSeconds * (0.12 + (index % 4) * 0.05)
      if (diya.position.y > 3) diya.position.y = -1
      diya.scale.setScalar(1 + Math.sin(this.elapsedSeconds * 7 + index * 1.7) * 0.25)
    }
  }
}

function createTempleCaption(): HtmlLayer {
  const element = sectionElement(
    'caption caption-right',
    `<span class="kicker">अध्याय III · The Temple</span>
     <h2>The Last Temple</h2>
     <p>A thousand diyas burn for a god who stopped listening. Tonight, one of them will answer.</p>`,
  )
  const caption = new HtmlLayer('temple-caption', element)
  caption.scrollRange = { start: 0.54, end: 0.7 }
  caption.scrub(fadeThroughTimeline(element))
  return caption
}

function createGodRaysLayer(): EdgeFadedShaderLayer {
  const rays = new EdgeFadedShaderLayer('god-rays', {
    fragmentShader: GOD_RAYS_FRAGMENT,
    blending: THREE.AdditiveBlending,
  })
  rays.scrollRange = { start: 0.51, end: 0.71 }
  rays.zIndex.value = 2
  return rays
}

export function createTempleLayers(): Layer[] {
  return [createGodRaysLayer(), new TempleLayer(), createTempleCaption()]
}
