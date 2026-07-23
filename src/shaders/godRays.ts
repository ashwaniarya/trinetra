import { SHADER_HELPERS } from './common'

export const GOD_RAYS_FRAGMENT = /* glsl */ `
${SHADER_HELPERS}
void main() {
  if (uOpacity < 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec2 delta = vUv - vec2(0.5, 0.18);
  delta.x *= uResolution.x / uResolution.y;
  float angle = atan(delta.y, delta.x);
  float sway = uTime * 0.03;
  float beams = 0.55 + 0.45 * sin(angle * 14.0 + sway + valueNoise(vec2(angle * 3.0, uTime * 0.1)) * 2.0);
  beams *= 0.6 + 0.4 * sin(angle * 5.0 - sway * 1.7);
  float strength = beams
    * smoothstep(1.1, 0.05, length(delta))
    * smoothstep(-0.05, 0.25, delta.y);
  gl_FragColor = vec4(SAFFRON_TINT * strength, strength * 0.35 * uOpacity);
}
`
