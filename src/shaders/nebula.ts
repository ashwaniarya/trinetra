import { SHADER_HELPERS } from './common'

export const NEBULA_FRAGMENT = /* glsl */ `
${SHADER_HELPERS}
void main() {
  vec2 p = vUv;
  p.x *= uResolution.x / uResolution.y;
  vec2 drift = vec2(uTime * 0.015, uTime * 0.006);
  float warp = fbm(p * 3.1 - drift);
  float smoke = fbm(p * 2.2 + drift + warp * 0.6);
  float warmth = 0.35 + 0.65 * uProgress;
  vec3 color = mix(DEEP_MAROON, EMBER_GLOW, smoothstep(0.35, 0.8, smoke) * warmth);
  color += SAFFRON_TINT * pow(smoothstep(0.7, 0.95, smoke), 2.0) * 0.25 * warmth;
  color *= 0.7 + 0.3 * smoothstep(0.0, 0.9, length(vUv - 0.5) * 1.4);
  gl_FragColor = vec4(color, 0.85 * uOpacity);
}
`
