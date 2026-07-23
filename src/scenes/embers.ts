import gsap from 'gsap'
import * as THREE from 'three'
import { ThreeLayer } from 'scroll-engine'
import { emberSprite } from '../sceneKit'
import { EMBER } from '../theme'

const EMBER_COUNT = 500
const BOUNDS = { x: 20, y: 12, z: 10 }

class EmberFieldLayer extends ThreeLayer {
  private positions!: THREE.BufferAttribute
  private points!: THREE.Points
  private material!: THREE.PointsMaterial

  constructor() {
    super('embers')
    this.zIndex.value = 0
  }

  protected override onInit(): void {
    super.onInit()
    const coordinates = new Float32Array(EMBER_COUNT * 3)
    for (let index = 0; index < EMBER_COUNT; index += 1) {
      coordinates[index * 3] = (Math.random() - 0.5) * BOUNDS.x
      coordinates[index * 3 + 1] = (Math.random() - 0.5) * BOUNDS.y
      coordinates[index * 3 + 2] = (Math.random() - 0.5) * BOUNDS.z
    }
    this.positions = new THREE.BufferAttribute(coordinates, 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', this.positions)
    this.material = new THREE.PointsMaterial({
      size: 0.14,
      map: emberSprite(),
      color: EMBER,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.points = new THREE.Points(geometry, this.material)
    this.scene.add(this.points)
    this.camera.position.z = 9
    this.scrub(
      gsap
        .timeline({ paused: true })
        .to(this.material, { opacity: 0.35, duration: 0.7, ease: 'none' }, 0)
        .to(this.material, { opacity: 1, duration: 0.3, ease: 'power2.in' }, 0.7),
    )
  }

  protected override onUpdate(deltaSeconds: number): void {
    for (let index = 0; index < EMBER_COUNT; index += 1) {
      let emberY = this.positions.getY(index) + deltaSeconds * (0.25 + (index % 5) * 0.06)
      if (emberY > BOUNDS.y / 2) emberY = -BOUNDS.y / 2
      this.positions.setY(index, emberY)
    }
    this.positions.needsUpdate = true
    this.points.rotation.y += deltaSeconds * 0.02
  }
}

export function createEmberLayer(): ThreeLayer {
  return new EmberFieldLayer()
}
