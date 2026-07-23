import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { DEVANAGARI, RELEASE, TITLE } from '../content'
import { emberSprite, sectionElement } from '../sceneKit'
import { BG, GOLD } from '../theme'

class ThirdEyeLayer extends ThreeLayer {
  private eye!: THREE.Group
  private outerRing!: THREE.Mesh
  private sparks!: THREE.Points
  private flare!: THREE.PointLight
  private sparkDirections!: Float32Array
  private sparkPositions!: THREE.BufferAttribute
  private readonly glow = { intensity: 0 }
  private readonly burst = { spread: 0 }
  private elapsedSeconds = 0

  constructor() {
    super('third-eye')
    this.scrollRange = { start: 0.8, end: 1 }
    this.zIndex.value = 4
  }

  protected override onInit(): void {
    super.onInit()
    this.scene.fog = new THREE.Fog(BG, 4, 24)
    this.eye = new THREE.Group()
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: GOLD,
      emissive: GOLD,
      emissiveIntensity: 0.2,
      metalness: 0.8,
      roughness: 0.3,
    })
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 24, 100), ringMaterial)
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff2cc, transparent: true, blending: THREE.AdditiveBlending }),
    )
    this.flare = new THREE.PointLight(GOLD, 0, 30)

    this.outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.03, 16, 100), ringMaterial)

    const rays = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.015, 0.015), ringMaterial, 24)
    const rayPlacement = new THREE.Object3D()
    for (let ray = 0; ray < 24; ray += 1) {
      const angle = (ray / 24) * Math.PI * 2
      rayPlacement.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0)
      rayPlacement.rotation.set(0, 0, angle)
      rayPlacement.updateMatrix()
      rays.setMatrixAt(ray, rayPlacement.matrix)
    }
    rays.instanceMatrix.needsUpdate = true

    const sparkCount = 120
    this.sparkDirections = new Float32Array(sparkCount * 3)
    const sparkCoordinates = new Float32Array(sparkCount * 3)
    for (let spark = 0; spark < sparkCount; spark += 1) {
      const direction = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize()
      this.sparkDirections[spark * 3] = direction.x
      this.sparkDirections[spark * 3 + 1] = direction.y
      this.sparkDirections[spark * 3 + 2] = direction.z
    }
    this.sparkPositions = new THREE.BufferAttribute(sparkCoordinates, 3)
    const sparkGeometry = new THREE.BufferGeometry()
    sparkGeometry.setAttribute('position', this.sparkPositions)
    this.sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({
        size: 0.08,
        map: emberSprite(),
        color: 0xfff2cc,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.sparks.visible = false

    this.eye.add(ring, pupil, this.flare, this.outerRing, rays, this.sparks)
    this.eye.scale.setScalar(0.2)
    this.scene.add(this.eye, new THREE.AmbientLight(GOLD, 0.1))
    this.camera.position.z = 8

    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(this.eye.scale, { x: 1, y: 1, z: 1, ease: 'power2.out', duration: 1 }, 0)
        .to(ringMaterial, { emissiveIntensity: 6, ease: 'power2.in', duration: 1 }, 0)
        .to(this.glow, { intensity: 30, ease: 'power2.in', duration: 1 }, 0)
        .to(this.burst, { spread: 1, ease: 'power2.out', duration: 1 }, 0)
        .to(this.camera.position, { z: 5, ease: 'power1.inOut', duration: 1 }, 0),
    )
  }

  protected override onScroll(scroll: ScrollState): void {
    this.opacity.value = Math.min(this.localProgress(scroll) / 0.12, 1)
  }

  protected override onUpdate(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds
    this.eye.rotation.z += deltaSeconds * 0.1
    this.outerRing.rotation.z -= deltaSeconds * 0.25
    this.flare.intensity = this.glow.intensity * (1 + Math.sin(this.elapsedSeconds * 13) * 0.06)
    this.sparks.visible = this.burst.spread > 0.02
    const sparkRadius = 0.3 + this.burst.spread * 3.5
    for (let spark = 0; spark < this.sparkPositions.count; spark += 1) {
      this.sparkPositions.setXYZ(
        spark,
        (this.sparkDirections[spark * 3] ?? 0) * sparkRadius,
        (this.sparkDirections[spark * 3 + 1] ?? 0) * sparkRadius,
        (this.sparkDirections[spark * 3 + 2] ?? 0) * sparkRadius,
      )
    }
    this.sparkPositions.needsUpdate = true
  }
}

function createFinaleCta(): HtmlLayer {
  const element = sectionElement(
    'finale',
    `<span class="devanagari">${DEVANAGARI}</span>
     <h1>${TITLE}</h1>
     <p class="release">${RELEASE}</p>
     <button class="cta" type="button">Watch the reveal</button>`,
  )
  element.style.pointerEvents = 'auto'
  const finale = new HtmlLayer('finale-cta', element)
  finale.scrollRange = { start: 0.88, end: 1 }
  const timeline = gsap.timeline({ paused: true })
  timeline.fromTo(
    element.children,
    { autoAlpha: 0, y: 40 },
    { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
    0.1,
  )
  finale.scrub(timeline)
  return finale
}

export function createFinaleLayers(): Layer[] {
  return [new ThirdEyeLayer(), createFinaleCta()]
}
