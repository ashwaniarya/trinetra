import gsap from 'gsap'
import * as THREE from 'three'
import { HtmlLayer, ThreeLayer, type Layer, type ScrollState } from 'scroll-engine'
import { SYNOPSIS } from '../content'
import { edgeFade, sectionElement } from '../sceneKit'
import { BG, EMBER, GOLD } from '../theme'

const TAU = Math.PI * 2

function petalGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.quadraticCurveTo(0.34, 0.42, 0, 1)
  shape.quadraticCurveTo(-0.34, 0.42, 0, 0)
  return new THREE.ShapeGeometry(shape, 12)
}

function glyphRingTexture(): THREE.CanvasTexture {
  const size = 1536
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2d canvas context unavailable')
  const texture = new THREE.CanvasTexture(canvas)
  const draw = (): void => {
    context.clearRect(0, 0, size, size)
    context.fillStyle = '#e0b055'
    context.font = '55px "Rozha One", serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const glyphs = ['त्रि', 'ने', 'त्र', 'ॐ']
    const slotCount = 28
    for (let slot = 0; slot < slotCount; slot += 1) {
      context.save()
      context.translate(size / 2, size / 2)
      context.rotate((slot / slotCount) * TAU)
      context.translate(0, -720)
      context.fillText(glyphs[slot % glyphs.length] ?? '', 0, 0)
      context.restore()
    }
    texture.needsUpdate = true
  }
  draw()
  // Rozha One may still be loading at engine init — redraw once fonts settle
  void document.fonts.ready.then(draw)
  return texture
}

class MandalaLayer extends ThreeLayer {
  private readonly spinners: { target: THREE.Object3D; speed: number }[] = []
  private readonly pulseMaterials: THREE.MeshStandardMaterial[] = []
  private halo!: THREE.Mesh
  private elapsedSeconds = 0

  constructor() {
    super('mandala')
    this.scrollRange = { start: 0.1, end: 0.36 }
    this.zIndex.value = 1
  }

  protected override onInit(): void {
    super.onInit()
    this.scene.fog = new THREE.Fog(BG, 3, 26)

    const bindu = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xf5cd82,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.halo = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 40),
      new THREE.MeshBasicMaterial({
        color: EMBER,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.halo.position.z = -0.02
    const binduLight = new THREE.PointLight(GOLD, 6, 9)
    this.scene.add(bindu, this.halo, binduLight)

    this.addBand(-0.05, 0.18, (band) => {
      band.add(this.ringMesh(0.55, 0.016))
      band.add(this.tickRing(0.55, 12, 0.09))
    })

    this.addBand(-0.25, -0.12, (band) => {
      const triangleMaterial = this.pulseMaterial()
      // TorusGeometry with 3 tubular segments collapses the loop into a triangle
      const upward = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.018, 8, 3), triangleMaterial)
      const downward = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.018, 8, 3), triangleMaterial)
      upward.rotation.z = Math.PI / 2
      downward.rotation.z = -Math.PI / 2
      band.add(upward, downward)
    })

    this.addBand(-0.5, 0.05, (band) => band.add(this.petalRing(12, 1.5, 0.75, 0)))

    this.addBand(-0.75, -0.07, (band) => {
      band.add(this.ringMesh(2.4, 0.025))
      band.add(this.beadRing(2.4, 8))
    })

    this.addBand(-1.0, -0.035, (band) => band.add(this.petalRing(20, 2.55, 1.05, TAU / 40)))

    this.addBand(-1.35, 0.05, (band) => {
      band.add(this.ringMesh(3.9, 0.028))
      band.add(this.tickRing(3.9, 48, 0.2, 0.12))
      band.add(this.diamondRing(3.9, 4))
    })

    this.addBand(-1.5, -0.02, (band) => {
      const glyphRing = new THREE.Mesh(
        new THREE.RingGeometry(4.15, 4.75, 96),
        new THREE.MeshBasicMaterial({
          map: glyphRingTexture(),
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      )
      band.add(glyphRing)
    })

    this.addBand(-1.7, -0.03, (band) => {
      band.add(this.ringMesh(5, 0.035))
      band.add(this.tickRing(5, 64, 0.16))
      band.add(this.beadRing(5, 8))
    })

    this.scene.add(new THREE.AmbientLight(GOLD, 0.2))
    this.camera.position.z = 14
    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(this.camera.position, { z: 1.5, ease: 'power1.inOut', duration: 1 }, 0)
        .to(this.camera.rotation, { z: 0.35, ease: 'power1.inOut', duration: 1 }, 0),
    )
  }

  protected override onScroll(scroll: ScrollState): void {
    this.opacity.value = edgeFade(this.localProgress(scroll))
  }

  protected override onUpdate(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds
    for (const { target, speed } of this.spinners) target.rotation.z += deltaSeconds * speed
    this.pulseMaterials.forEach((material, index) => {
      material.emissiveIntensity = 0.35 + Math.sin(this.elapsedSeconds * 1.2 + index * 0.9) * 0.18
    })
    this.halo.scale.setScalar(1 + Math.sin(this.elapsedSeconds * 2.1) * 0.08)
  }

  private addBand(depth: number, speed: number, build: (band: THREE.Group) => void): void {
    const band = new THREE.Group()
    band.position.z = depth
    build(band)
    this.spinners.push({ target: band, speed })
    this.scene.add(band)
  }

  private pulseMaterial(opacity = 1): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color: GOLD,
      emissive: GOLD,
      emissiveIntensity: 0.35,
      metalness: 0.8,
      roughness: 0.3,
      side: THREE.DoubleSide,
      transparent: opacity < 1,
      opacity,
    })
    this.pulseMaterials.push(material)
    return material
  }

  private ringMesh(radius: number, tube: number): THREE.Mesh {
    return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 140), this.pulseMaterial())
  }

  private tickRing(radius: number, count: number, length: number, shortLength?: number): THREE.InstancedMesh {
    const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 1, 0.02), this.pulseMaterial(), count)
    const placement = new THREE.Object3D()
    for (let tick = 0; tick < count; tick += 1) {
      const angle = (tick / count) * TAU
      const tickLength = shortLength !== undefined && tick % 2 === 1 ? shortLength : length
      placement.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      placement.rotation.set(0, 0, angle - Math.PI / 2)
      placement.scale.set(1, tickLength, 1)
      placement.updateMatrix()
      ticks.setMatrixAt(tick, placement.matrix)
    }
    ticks.instanceMatrix.needsUpdate = true
    return ticks
  }

  private beadRing(radius: number, count: number): THREE.InstancedMesh {
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 10, 10), this.pulseMaterial(), count)
    const placement = new THREE.Object3D()
    for (let bead = 0; bead < count; bead += 1) {
      const angle = (bead / count) * TAU + Math.PI / count
      placement.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      placement.updateMatrix()
      beads.setMatrixAt(bead, placement.matrix)
    }
    beads.instanceMatrix.needsUpdate = true
    return beads
  }

  private diamondRing(radius: number, count: number): THREE.InstancedMesh {
    const diamonds = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.1), this.pulseMaterial(), count)
    const placement = new THREE.Object3D()
    for (let diamond = 0; diamond < count; diamond += 1) {
      const angle = (diamond / count) * TAU
      placement.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      placement.rotation.set(0, 0, angle)
      placement.scale.set(1, 1.6, 0.5)
      placement.updateMatrix()
      diamonds.setMatrixAt(diamond, placement.matrix)
    }
    diamonds.instanceMatrix.needsUpdate = true
    return diamonds
  }

  private petalRing(count: number, baseRadius: number, petalScale: number, angleOffset: number): THREE.InstancedMesh {
    const petals = new THREE.InstancedMesh(petalGeometry(), this.pulseMaterial(0.6), count)
    const placement = new THREE.Object3D()
    for (let petal = 0; petal < count; petal += 1) {
      const angle = (petal / count) * TAU + angleOffset
      placement.position.set(Math.cos(angle) * baseRadius, Math.sin(angle) * baseRadius, 0)
      placement.rotation.set(0, 0, angle - Math.PI / 2)
      placement.scale.setScalar(petalScale)
      placement.updateMatrix()
      petals.setMatrixAt(petal, placement.matrix)
    }
    petals.instanceMatrix.needsUpdate = true
    return petals
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
  for (const line of lines) {
    const words = (line.textContent ?? '').split(' ')
    // spacing lives on .word margins — bare text-node separators get mangled between transformed spans
    line.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join('')
  }
  const timeline = gsap.timeline({ paused: true })
  const slotWidth = 1 / lines.length
  lines.forEach((line, index) => {
    const slotStart = index * slotWidth
    timeline
      .fromTo(line, { autoAlpha: 0 }, { autoAlpha: 1, duration: slotWidth * 0.06 }, slotStart)
      .fromTo(
        line.querySelectorAll('.word'),
        { y: 26, autoAlpha: 0, filter: 'blur(8px)' },
        {
          y: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: slotWidth * 0.28,
          stagger: slotWidth * 0.025,
          ease: 'power2.out',
        },
        slotStart + slotWidth * 0.02,
      )
      .to(
        line,
        { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: slotWidth * 0.35, ease: 'power2.in' },
        slotStart + slotWidth * 0.6,
      )
  })
  prophecy.scrub(timeline)
  return prophecy
}

export function createProphecyLayers(): Layer[] {
  return [new MandalaLayer(), createProphecyTextLayer()]
}
