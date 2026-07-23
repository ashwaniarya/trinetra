import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { EdgeFadedShaderLayer, edgeFade, fadeThroughTimeline, sectionElement } from '../sceneKit'
import { HEAT_HAZE_FRAGMENT } from '../shaders/heatHaze'
import { BG, EMBER, GOLD, SAFFRON } from '../theme'

const BLADE_PROFILE: Array<[number, number]> = [
  [0, 0],
  [0.33, 0.05],
  [0.8, 0.24],
  [1, 0.42],
  [0.84, 0.62],
  [0.45, 0.83],
  [0.001, 1],
]

function bladeGeometry(height: number, halfWidth: number): THREE.LatheGeometry {
  const points = BLADE_PROFILE.map(([radius, y]) => new THREE.Vector2(radius * halfWidth, y * height))
  return new THREE.LatheGeometry(points, 24)
}

class TrishulLayer extends ThreeLayer {
  private trishul!: THREE.Group
  private aura!: THREE.Group
  private bladeMaterial!: THREE.MeshStandardMaterial
  private midribMaterial!: THREE.MeshStandardMaterial
  private fittingMaterial!: THREE.MeshStandardMaterial
  private elapsedSeconds = 0

  constructor() {
    super('trishul')
    this.scrollRange = { start: 0.33, end: 0.53 }
    this.zIndex.value = 2
  }

  protected override onInit(): void {
    super.onInit()
    this.scene.fog = new THREE.Fog(BG, 4, 22)
    this.bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0e2c0,
      metalness: 0.85,
      roughness: 0.22,
      emissive: GOLD,
      emissiveIntensity: 0.12,
    })
    this.midribMaterial = new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.7,
      roughness: 0.3,
      emissive: SAFFRON,
      emissiveIntensity: 0.55,
    })
    this.fittingMaterial = new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.9,
      roughness: 0.25,
      emissive: GOLD,
      emissiveIntensity: 0.15,
    })
    this.trishul = new THREE.Group()

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 7, 20), this.fittingMaterial)

    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), this.fittingMaterial)
    hub.position.y = 3.28
    hub.scale.y = 0.6
    for (const [bandY, bandRadius, bandTube] of [
      [2.95, 0.1, 0.03],
      [3.1, 0.09, 0.02],
      [1.6, 0.08, 0.022],
      [-3.35, 0.09, 0.02],
    ] as Array<[number, number, number]>) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandRadius, bandTube, 10, 28), this.fittingMaterial)
      band.position.y = bandY
      band.rotation.x = Math.PI / 2
      this.trishul.add(band)
    }

    const crescentArc = Math.PI * 1.2
    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 12, 60, crescentArc), this.fittingMaterial)
    crescent.position.y = 2.68
    crescent.rotation.z = -Math.PI / 2 - crescentArc / 2
    this.trishul.add(crescent)

    const damaru = new THREE.Group()
    for (const side of [-1, 1]) {
      const drumHalf = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.11, 12), this.midribMaterial)
      drumHalf.position.x = side * 0.055
      drumHalf.rotation.z = side * (Math.PI / 2)
      damaru.add(drumHalf)
    }
    damaru.position.set(-0.28, 2.48, 0.14)
    damaru.rotation.set(0, 0.6, -0.35)
    this.trishul.add(damaru)

    const centerBlade = this.blade(2.1, 0.28)
    centerBlade.position.y = 3.42
    this.trishul.add(centerBlade)
    for (const side of [-1, 1]) {
      const prongCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(side * 0.14, 3.3, 0),
        new THREE.Vector3(side * 0.62, 3.35, 0),
        new THREE.Vector3(side * 0.8, 3.75, 0),
        new THREE.Vector3(side * 0.8, 4.3, 0),
      )
      const prong = new THREE.Mesh(new THREE.TubeGeometry(prongCurve, 24, 0.045, 10), this.fittingMaterial)
      const sideBlade = this.blade(1.15, 0.17)
      sideBlade.position.set(side * 0.8, 4.28, 0)
      sideBlade.rotation.z = side * -0.05
      this.trishul.add(prong, sideBlade)
    }

    for (let grip = 0; grip < 5; grip += 1) {
      const gripRing = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 8, 24), this.fittingMaterial)
      gripRing.position.y = -0.6 - grip * 0.2
      gripRing.rotation.x = Math.PI / 2
      this.trishul.add(gripRing)
    }

    const finialSphere = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), this.fittingMaterial)
    finialSphere.position.y = -3.55
    const finialPoint = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 16), this.fittingMaterial)
    finialPoint.position.y = -3.9
    finialPoint.rotation.x = Math.PI
    const pedestalGlow = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 40),
      new THREE.MeshBasicMaterial({
        color: EMBER,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    pedestalGlow.rotation.x = -Math.PI / 2
    pedestalGlow.position.y = -3.6

    this.aura = new THREE.Group()
    const auraRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.018, 12, 100),
      new THREE.MeshStandardMaterial({
        color: GOLD,
        metalness: 0.6,
        roughness: 0.4,
        emissive: SAFFRON,
        emissiveIntensity: 1.2,
      }),
    )
    const auraDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 48),
      new THREE.MeshBasicMaterial({
        color: EMBER,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.aura.add(auraRing, auraDisc)
    this.aura.position.set(0, 4.15, -0.7)

    this.trishul.add(shaft, hub, finialSphere, finialPoint, pedestalGlow, this.aura)
    this.trishul.position.y = -7

    const rimLight = new THREE.DirectionalLight(GOLD, 3)
    rimLight.position.set(0, 3, -5)
    const keyLight = new THREE.DirectionalLight(SAFFRON, 0.8)
    keyLight.position.set(3, 2, 4)
    const warmFill = new THREE.PointLight(EMBER, 8, 12)
    warmFill.position.set(0, 0.5, 2.5)
    this.scene.add(this.trishul, rimLight, keyLight, warmFill, new THREE.AmbientLight(EMBER, 0.15))
    this.camera.position.set(0, 1.2, 12)

    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(this.trishul.position, { y: 0, ease: 'power2.out', duration: 0.6 }, 0)
        .fromTo(this.trishul.rotation, { y: -0.4 }, { y: 0.4, ease: 'none', duration: 1 }, 0)
        .to(this.camera.position, { z: 9, y: 2.4, ease: 'power1.inOut', duration: 1 }, 0),
    )
  }

  protected override onScroll(scroll: ScrollState): void {
    this.opacity.value = edgeFade(this.localProgress(scroll))
  }

  protected override onUpdate(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds
    this.trishul.rotation.z = Math.sin(this.elapsedSeconds * 0.8) * 0.02
    this.aura.rotation.z += deltaSeconds * 0.2
    this.aura.scale.setScalar(1 + Math.sin(this.elapsedSeconds * 2.4) * 0.04)
  }

  private blade(height: number, halfWidth: number): THREE.Group {
    const bladeShape = new THREE.Group()
    const body = new THREE.Mesh(bladeGeometry(height, halfWidth), this.bladeMaterial)
    body.scale.z = 0.24
    const midrib = new THREE.Mesh(bladeGeometry(height * 0.97, halfWidth * 0.4), this.midribMaterial)
    midrib.scale.z = 0.3
    midrib.position.y = height * 0.015
    bladeShape.add(body, midrib)
    return bladeShape
  }
}

function createWeaponCaption(): HtmlLayer {
  const element = sectionElement(
    'caption caption-left',
    `<span class="kicker">अध्याय II · The Weapon</span>
     <h2>The Trishul</h2>
     <p>Forged from the first flame and cooled in the last river, the trishul chooses its bearer — and unmakes him.</p>`,
  )
  const caption = new HtmlLayer('weapon-caption', element)
  caption.scrollRange = { start: 0.36, end: 0.52 }
  caption.scrub(fadeThroughTimeline(element))
  return caption
}

function createHeatHazeLayer(): EdgeFadedShaderLayer {
  const haze = new EdgeFadedShaderLayer('heat-haze', {
    fragmentShader: HEAT_HAZE_FRAGMENT,
    blending: THREE.AdditiveBlending,
  })
  haze.scrollRange = { start: 0.33, end: 0.53 }
  haze.zIndex.value = 1
  return haze
}

export function createWeaponLayers(): Layer[] {
  return [createHeatHazeLayer(), new TrishulLayer(), createWeaponCaption()]
}
