import {VALUE_NOISE_SHADER} from '../value-noise-shader.js';

// Adapted from EffectCraft's distort2.rs; see ../../THIRD_PARTY_LICENSES.md.
// https://github.com/storytold/effectcraft/blob/8f02f52a44a4b1ea807d8824b92301b96f896a06/crates/effects/src/distort2.rs#L38
export const TURBULENT_DISPLACE_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uSize;
uniform vec2 uOffset;
uniform float uComplexity;
uniform float uEvolution;
uniform bool uCycleEvolution;
uniform float uCycle;
uniform uint uSeed;
uniform int uDisplacement;
uniform int uPinning;
const int uNoiseType = 2;

${VALUE_NOISE_SHADER}

float noiseLayer(vec2 p, float z, uint seed) {
  if (!uCycleEvolution) return valueNoise(vec3(p, uEvolution + z), seed);
  float t = mod(uEvolution, uCycle);
  // Zero blend derivatives at the seam keep the looping motion smooth.
  float weight = smoothstep(0.0, 1.0, t / uCycle);
  return mix(valueNoise(vec3(p, t + z), seed), valueNoise(vec3(p, t - uCycle + z), seed), weight);
}

float turbulence(vec2 p, uint channel) {
  float sum = 0.0;
  float norm = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float falloff = uDisplacement >= 3 && uDisplacement <= 5 ? 0.3 : 0.5;
  for (int octave = 0; octave < 10; octave++) {
    float weight = clamp(uComplexity - float(octave), 0.0, 1.0);
    if (weight == 0.0) break;
    uint seed = (uSeed ^ 0x7d15u) + channel + uint(octave) * 101u;
    sum += noiseLayer(p * frequency, float(octave) * 5.17, seed) * amplitude * weight;
    norm += amplitude * weight;
    amplitude *= falloff;
    frequency *= 2.0;
  }
  return sum / norm - 0.5;
}

vec4 readPixel(ivec2 p) {
  if (any(lessThan(p, ivec2(0))) || any(greaterThanEqual(p, ivec2(uResolution)))) return vec4(0.0);
  return texelFetch(uSource, ivec2(p.x, int(uResolution.y) - 1 - p.y), 0);
}

vec4 sampleSource(vec2 p) {
  // Bilinear interpolation with transparent samples outside the source, so
  // warped alpha edges do not smear the outermost pixel across the canvas.
  ivec2 base = ivec2(floor(p - 0.5));
  vec2 t = fract(p - 0.5);
  return mix(mix(readPixel(base), readPixel(base + ivec2(1,0)), t.x),
    mix(readPixel(base + ivec2(0,1)), readPixel(base + ivec2(1,1)), t.x), t.y);
}

void main() {
  if (uAmount == 0.0) {
    fragColor = texture(uSource, vUv);
    return;
  }
  vec2 pixel = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 p = (pixel - uOffset * uResolution) / uSize;
  vec2 displacement;
  if (uDisplacement == 1 || uDisplacement == 2 || uDisplacement == 4 || uDisplacement == 5) {
    float epsilon = 0.05;
    vec2 gradient = vec2(
      turbulence(p + vec2(epsilon,0), 0u) - turbulence(p - vec2(epsilon,0), 0u),
      turbulence(p + vec2(0,epsilon), 0u) - turbulence(p - vec2(0,epsilon), 0u)
    ) / (2.0 * epsilon);
    displacement = (uDisplacement == 1 || uDisplacement == 4) ? gradient : vec2(-gradient.y, gradient.x);
    displacement *= uAmount * 0.25;
  } else if (uDisplacement == 6) {
    displacement = vec2(0.0, turbulence(p, 17u) * uAmount);
  } else if (uDisplacement == 7) {
    displacement = vec2(turbulence(p, 0u) * uAmount, 0.0);
  } else if (uDisplacement == 8) {
    displacement = vec2(turbulence(p, 0u) * uAmount);
  } else {
    displacement = vec2(turbulence(p, 0u), turbulence(p, 17u)) * uAmount;
  }
  bool locked = uPinning >= 8;
  int pin = locked ? uPinning - 7 : uPinning;
  float edge = max(1.0, min(uResolution.x, uResolution.y) * (locked ? 0.25 : 0.1));
  vec2 nearEdge = clamp((pixel - 0.5) / edge, 0.0, 1.0);
  vec2 farEdge = clamp((uResolution - 0.5 - pixel) / edge, 0.0, 1.0);
  float horizontal = min(nearEdge.x, farEdge.x);
  float vertical = min(nearEdge.y, farEdge.y);
  float weight = 1.0;
  if (pin == 1) weight = min(horizontal, vertical);
  if (pin == 2) weight = vertical;
  if (pin == 3) weight = horizontal;
  if (pin == 4) weight = nearEdge.x;
  if (pin == 5) weight = nearEdge.y;
  if (pin == 6) weight = farEdge.x;
  if (pin == 7) weight = farEdge.y;
  vec2 sourcePixel = pixel + displacement * weight;
  if (locked) sourcePixel = clamp(sourcePixel, vec2(0.5), uResolution - 0.5);
  fragColor = sampleSource(sourcePixel);
}
`;
