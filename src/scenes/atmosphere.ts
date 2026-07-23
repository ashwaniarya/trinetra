import { ShaderLayer, type Layer } from 'scroll-engine'
import { GRAIN_FRAGMENT } from '../shaders/grain'
import { NEBULA_FRAGMENT } from '../shaders/nebula'

export function createAtmosphereLayers(): Layer[] {
  const nebula = new ShaderLayer('nebula', { fragmentShader: NEBULA_FRAGMENT })
  nebula.zIndex.value = -10
  const grain = new ShaderLayer('grain', { fragmentShader: GRAIN_FRAGMENT })
  grain.zIndex.value = 10
  return [nebula, grain]
}
