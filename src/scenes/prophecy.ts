import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { SYNOPSIS } from '../content'
import { edgeFade, sectionElement } from '../sceneKit'
import { BG, GOLD } from '../theme'

const RING_COUNT = 6

class MandalaLayer extends ThreeLayer {
  private readonly ringGroups: THREE.Group[] = []
  private readonly ringMaterials: THREE.MeshStandardMaterial[] = []
  private elapsedSeconds = 0

  constructor() {
    super('mandala')
    this.scrollRange = { start: 0.1, end: 0.36 }
    this.zIndex.value = 1
  }

  protected override onInit(): void {
    super.onInit()
    this.scene.fog = new THREE.Fog(BG, 4, 26)
    const placement = new THREE.Object3D()
    for (let ringIndex = 0; ringIndex < RING_COUNT; ringIndex += 1) {
      const radius = 1 + ringIndex
      const material = new THREE.MeshStandardMaterial({
        color: GOLD,
        emissive: GOLD,
        emissiveIntensity: 0.4,
        metalness: 0.8,
        roughness: 0.3,
      })
      const ringGroup = new THREE.Group()
      ringGroup.add(
        new THREE.Mesh(new THREE.TorusGeometry(radius, 0.02 + ringIndex * 0.008, 12, 120), material),
      )

      const tickCount = 24 + ringIndex * 8
      const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.14, 0.02), material, tickCount)
      for (let tick = 0; tick < tickCount; tick += 1) {
        const angle = (tick / tickCount) * Math.PI * 2
        placement.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
        placement.rotation.set(0, 0, angle - Math.PI / 2)
        placement.updateMatrix()
        ticks.setMatrixAt(tick, placement.matrix)
      }
      ticks.instanceMatrix.needsUpdate = true
      ringGroup.add(ticks)

      const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 8), material, 8)
      for (let bead = 0; bead < 8; bead += 1) {
        const angle = (bead / 8) * Math.PI * 2 + Math.PI / 8
        placement.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
        placement.rotation.set(0, 0, 0)
        placement.updateMatrix()
        beads.setMatrixAt(bead, placement.matrix)
      }
      beads.instanceMatrix.needsUpdate = true
      ringGroup.add(beads)

      ringGroup.position.z = -ringIndex * 0.35
      this.ringGroups.push(ringGroup)
      this.ringMaterials.push(material)
      this.scene.add(ringGroup)
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
    this.elapsedSeconds += deltaSeconds
    this.ringGroups.forEach((ringGroup, ringIndex) => {
      ringGroup.rotation.z += deltaSeconds * 0.06 * (ringIndex % 2 === 0 ? 1 : -1)
    })
    this.ringMaterials.forEach((material, ringIndex) => {
      material.emissiveIntensity = 0.4 + Math.sin(this.elapsedSeconds * 1.2 + ringIndex) * 0.15
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
