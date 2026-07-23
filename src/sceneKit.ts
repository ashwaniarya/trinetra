import gsap from 'gsap'
import * as THREE from 'three'
import { GOLD } from './theme'

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
