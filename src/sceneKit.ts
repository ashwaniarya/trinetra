import gsap from 'gsap'
import * as THREE from 'three'
import { ShaderLayer, type ScrollState } from 'scroll-engine'
import { GOLD } from './theme'

export class EdgeFadedShaderLayer extends ShaderLayer {
  protected override onScroll(scroll: ScrollState): void {
    super.onScroll(scroll)
    this.opacity.value = edgeFade(this.localProgress(scroll))
  }
}

export function sectionElement(className: string, html: string): HTMLElement {
  const element = document.createElement('section')
  element.className = className
  element.innerHTML = html
  return element
}

export function fadeThroughTimeline(element: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true })
    .fromTo(element, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    .to(element, { autoAlpha: 0, y: -40, duration: 0.3, ease: 'power2.in' }, 0.7)
}

export function edgeFade(localProgress: number, margin = 0.12): number {
  return Math.min(localProgress / margin, 1, (1 - localProgress) / margin)
}

export function goldMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.9, roughness: 0.25 })
}

// warm studio for PMREM: gold must reflect firelight, not a white room — neutral
// envs get tone-mapped to white on polished metal and erase the tint
export function emberEnvironmentScene(): THREE.Scene {
  const environment = new THREE.Scene()
  const panel = (
    red: number,
    green: number,
    blue: number,
    width: number,
    height: number,
    position: [number, number, number],
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(red, green, blue), side: THREE.DoubleSide }),
    )
    mesh.position.set(...position)
    mesh.lookAt(0, 0, 0)
    return mesh
  }
  environment.add(
    panel(1.5, 1.15, 0.65, 4, 7, [3, 4, 6]),
    panel(2.4, 1.2, 0.4, 3, 9, [-7, 1, 1]),
    panel(1.6, 0.7, 0.25, 3, 9, [7, 0, -2]),
    panel(1.4, 0.65, 0.2, 8, 4, [0, 4, -7]),
    panel(0.5, 0.16, 0.05, 10, 10, [0, -6, 0]),
  )
  return environment
}

export function emberSprite(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2d canvas context unavailable')
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 190, 120, 1)')
  gradient.addColorStop(0.4, 'rgba(255, 122, 51, 0.6)')
  gradient.addColorStop(1, 'rgba(255, 122, 51, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}
