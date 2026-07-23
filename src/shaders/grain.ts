import { SHADER_HELPERS } from './common'

export const GRAIN_FRAGMENT = /* glsl */ `
${SHADER_HELPERS}
void main() {
  float speckle = hash(gl_FragCoord.xy + fract(uTime * 7.0) * 1013.0);
  float vignette = smoothstep(0.55, 1.25, length(vUv - 0.5) * 1.7);
  vec3 color = mix(vec3(speckle), vec3(0.0), vignette);
  float alpha = (0.05 + vignette * 0.4) * uOpacity;
  gl_FragColor = vec4(color, alpha);
}
`
