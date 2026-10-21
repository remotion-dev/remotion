import {VALUE_NOISE_SHADER} from '../value-noise-shader.js';

// Adapted to WebGL2; see ../../THIRD_PARTY_LICENSES.md.
// Multi-octave value noise and texture modes based on Effectcraft's noise3.rs:
// https://github.com/storytold/effectcraft/blob/8f02f52a44a4b1ea807d8824b92301b96f896a06/crates/effects/src/noise3.rs
export const FRACTAL_NOISE_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uOffset;
uniform float uScale;
uniform float uComplexity;
uniform float uEvolution;
uniform float uSubInfluence;
uniform float uSubScaling;
uniform float uContrast;
uniform float uBrightness;
uniform float uAmount;
uniform float uCycle;
uniform uint uSeed;
uniform int uFractalType;
uniform int uNoiseType;
uniform bool uInvert;
uniform bool uCycleEvolution;

${VALUE_NOISE_SHADER}

float layer(vec2 p, float z, uint seed) {
  if (!uCycleEvolution) return valueNoise(vec3(p, uEvolution + z), seed);
  float t = mod(uEvolution, uCycle);
  return mix(valueNoise(vec3(p, t + z), seed), valueNoise(vec3(p, t - uCycle + z), seed), t / uCycle);
}

float shape(float n) {
  float s = 2.0 * n - 1.0;
  if (uFractalType == 1) return 1.0 - s * s;
  if (uFractalType == 2) return 1.0 - abs(s);
  if (uFractalType == 3) return (1.0 - abs(s)) * (1.0 - abs(s));
  if (uFractalType == 8) {
    float distance = clamp(abs(s) / 0.12, 0.0, 1.0);
    return 1.0 - distance * distance;
  }
  return n;
}

void main() {
  vec4 source = texture(uSource, vUv);
  if (source.a == 0.0 || uAmount == 0.0) {
    fragColor = source;
    return;
  }
  vec2 pixel = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 base = (pixel - uResolution * 0.5 - uOffset) / uScale;
  float sum = 0.0;
  float norm = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float best = 0.0;
  for (int octave = 0; octave < 20; octave++) {
    float weight = clamp(uComplexity - float(octave), 0.0, 1.0);
    if (weight == 0.0 || amplitude == 0.0) break;
    vec2 p = base * frequency;
    float z = float(octave) * 7.31;
    uint seed = (uSeed ^ 0x51edu) + uint(octave);
    if (uFractalType >= 4 && uFractalType <= 6) {
      float a = layer(p * 0.5, z + 3.1, seed ^ 0x55u) - 0.5;
      if (uFractalType == 5) {
        float angle = a * 3.0;
        p = mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * p;
      } else {
        float b = layer(p * 0.5, z + 5.7, seed ^ 0xaau) - 0.5;
        float strength = uFractalType == 6 ? 0.5 + float(octave) * 0.35 : 1.0;
        p += vec2(a, b) * 1.5 * strength;
      }
    }
    float n = shape(layer(p, z, seed));
    // Fade fractional octaves in for Max too, so animating complexity is continuous.
    best = max(best, n * amplitude * weight);
    sum += n * amplitude * weight;
    norm += amplitude * weight;
    amplitude *= uSubInfluence;
    frequency /= uSubScaling;
  }
  float noise = uFractalType == 7 ? best : sum / norm;
  noise = clamp((noise - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  if (uInvert) noise = 1.0 - noise;
  fragColor = vec4(mix(source.rgb, vec3(noise) * source.a, uAmount), source.a);
}
`;
