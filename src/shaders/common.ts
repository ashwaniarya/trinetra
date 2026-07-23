export const SHADER_HELPERS = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uOpacity;
uniform vec2 uResolution;
varying vec2 vUv;

const vec3 DEEP_MAROON = vec3(0.086, 0.016, 0.031);
const vec3 EMBER_GLOW = vec3(0.55, 0.22, 0.08);
const vec3 SAFFRON_TINT = vec3(0.91, 0.53, 0.16);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(cell), hash(cell + vec2(1.0, 0.0)), u.x),
    mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 5; octave++) {
    sum += amplitude * valueNoise(p);
    p = p * 2.03 + vec2(17.0);
    amplitude *= 0.5;
  }
  return sum;
}
`
