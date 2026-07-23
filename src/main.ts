import './style.css'
import { createStage, DevPanel, Engine, HtmlRenderer, ThreeRenderer } from 'scroll-engine'
import { createCastLayer } from './scenes/cast'
import { createEmberLayer } from './scenes/embers'
import { createFinaleLayers } from './scenes/finale'
import { createHeroLayer } from './scenes/hero'
import { createProphecyLayers } from './scenes/prophecy'
import { createTempleLayers } from './scenes/temple'
import { createWeaponLayers } from './scenes/weapon'

const engine = Engine.create({ ...createStage(), screens: 7 })
engine.addRenderer(ThreeRenderer.create())
engine.addRenderer(HtmlRenderer.create())

for (const layer of [
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
