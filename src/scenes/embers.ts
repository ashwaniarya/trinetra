import gsap from 'gsap'
import * as THREE from 'three'
import { ThreeLayer } from 'scroll-engine'
import { emberSprite } from '../sceneKit'
import { EMBER, GOLD } from '../theme'

const BOUNDS = { x: 20, y: 12, z: 10 }

interface ParticleField {
  points: THREE.Points
  positions: THREE.BufferAttribute
  baseX: Float32Array
  material: THREE.PointsMaterial
  count: number
  riseSpeed: number
}

function createParticleField(
  count: number,
  size: number,
  color: number,
  opacity: number,
  riseSpeed: number,
  sprite: THREE.CanvasTexture,
): ParticleField {
  const coordinates = new Float32Array(count * 3)
  const baseX = new Float32Array(count)
  for (let index = 0; index < count; index += 1) {
    const x = (Math.random() - 0.5) * BOUNDS.x
    baseX[index] = x
    coordinates[index * 3] = x
    coordinates[index * 3 + 1] = (Math.random() - 0.5) * BOUNDS.y
    coordinates[index * 3 + 2] = (Math.random() - 0.5) * BOUNDS.z
  }
  const positions = new THREE.BufferAttribute(coordinates, 3)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', positions)
  const material = new THREE.PointsMaterial({
    size,
    map: sprite,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  return { points: new THREE.Points(geometry, material), positions, baseX, material, count, riseSpeed }
}

class EmberFieldLayer extends ThreeLayer {
  private readonly fields: ParticleField[] = []
  private elapsedSeconds = 0

  constructor() {
    super('embers')
    this.zIndex.value = 0
  }

  protected override onInit(): void {
    super.onInit()
    const sprite = emberSprite()
    const embers = createParticleField(500, 0.14, EMBER, 0.9, 1, sprite)
    const goldSparks = createParticleField(180, 0.07, GOLD, 0.7, 0.6, sprite)
    this.fields.push(embers, goldSparks)
    for (const field of this.fields) this.scene.add(field.points)
    this.camera.position.z = 9
    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(embers.material, { opacity: 0.35, duration: 0.7, ease: 'none' }, 0)
        .to(embers.material, { opacity: 1, duration: 0.3, ease: 'power2.in' }, 0.7)
        .to(goldSparks.material, { opacity: 0.25, duration: 0.7, ease: 'none' }, 0)
        .to(goldSparks.material, { opacity: 0.8, duration: 0.3, ease: 'power2.in' }, 0.7),
    )
  }

  protected override onUpdate(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds
    for (const field of this.fields) {
      for (let index = 0; index < field.count; index += 1) {
        let particleY =
          field.positions.getY(index) + deltaSeconds * field.riseSpeed * (0.25 + (index % 5) * 0.06)
        if (particleY > BOUNDS.y / 2) particleY = -BOUNDS.y / 2
        field.positions.setY(index, particleY)
        field.positions.setX(
          index,
          (field.baseX[index] ?? 0) + Math.sin(this.elapsedSeconds * 0.6 + index * 1.3) * 0.25,
        )
      }
      field.positions.needsUpdate = true
      field.points.rotation.y += deltaSeconds * 0.02
    }
  }
}

export function createEmberLayer(): ThreeLayer {
  return new EmberFieldLayer()
}
