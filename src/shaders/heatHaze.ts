import { SHADER_HELPERS } from './common'

export const HEAT_HAZE_FRAGMENT = /* glsl */ `
${SHADER_HELPERS}
void main() {
  if (uOpacity < 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float centerMask = smoothstep(0.45, 0.12, abs(vUv.x - 0.5));
  float lowMask = smoothstep(0.85, 0.15, vUv.y);
  float rise = uTime * 0.35;
  float bands = valueNoise(vec2(vUv.x * 14.0, vUv.y * 6.0 - rise * 2.0));
  float shimmer = 0.5 + 0.5 * sin((vUv.y + bands * 0.12 - rise) * 40.0);
  float intensity = smoothstep(0.25, 1.0, bands) * shimmer;
  float alpha = intensity * centerMask * lowMask * 0.12 * uOpacity;
  gl_FragColor = vec4(vec3(1.0, 0.45, 0.15) * intensity, alpha);
}
`
