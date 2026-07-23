import './style.css'
import { ACESFilmicToneMapping } from 'three'
import { createStage, DevPanel, Engine, HtmlRenderer, ThreeRenderer } from 'scroll-engine'
import { createAtmosphereLayers } from './scenes/atmosphere'
import { createCastLayer } from './scenes/cast'
import { createEmberLayer } from './scenes/embers'
import { createFinaleLayers } from './scenes/finale'
import { createHeroLayer } from './scenes/hero'
import { createProphecyLayers } from './scenes/prophecy'
import { createTempleLayers } from './scenes/temple'
import { createWeaponLayers } from './scenes/weapon'

const engine = Engine.create({ ...createStage(), screens: 7 })
engine.addRenderer(ThreeRenderer.create({ toneMapping: ACESFilmicToneMapping }))
engine.addRenderer(HtmlRenderer.create())

for (const layer of [
  ...createAtmosphereLayers(),
  createEmberLayer(),
  ...createProphecyLayers(),
  ...createWeaponLayers(),
  ...createTempleLayers(),
  ...createFinaleLayers(),
  createHeroLayer(),
  createCastLayer(),
]) {
  engine.addLayer(layer)
}

engine.start()
DevPanel.create()
;(window as typeof window & { scrollEngine?: Engine }).scrollEngine = engine
