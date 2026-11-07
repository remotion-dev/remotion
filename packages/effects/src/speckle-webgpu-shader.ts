import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const SPECKLE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, density: f32, radius: f32, randomness: f32, }

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(p.xyx * vec3f(443.8975, 397.2973, 491.1871));
  p3 += vec3f(dot(p3, p3.yzx + vec3f(19.19)));
  return fract((p3.x + p3.y) * p3.z);
}

fn hash22(p: vec2f) -> vec2f { return vec2f(hash21(p + vec2f(17.13)), hash21(p + vec2f(83.71))); }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
  if (params.density <= 0.0 || params.radius <= 0.0) { return color; }
  let fragPos = vec2f(input.uv.x, 1.0 - input.uv.y) * params.size;
  let cellSize = max(params.radius * 2.5, 1.0);
  let baseCell = floor(fragPos / cellSize);
  var hole = 0.0;
  for (var y = -1; y <= 1; y++) {
    for (var x = -1; x <= 1; x++) {
      let cell = baseCell + vec2f(f32(x), f32(y));
      if (hash21(cell) <= params.density) {
        let randomOffset = (hash22(cell + vec2f(11.7)) - vec2f(0.5)) * params.randomness;
        let center = (cell + vec2f(0.5) + randomOffset) * cellSize;
        let variation = mix(1.0, 0.35 + hash21(cell + vec2f(29.43)) * 0.65, params.randomness);
        let radius = params.radius * 0.5 * variation;
        let edge = min(1.0, max(radius * 0.5, 0.35));
        hole = max(hole, 1.0 - smoothstep(radius - edge, radius + edge, length(fragPos - center)));
      }
    }
  }
  return color * (1.0 - clamp(hole, 0.0, 1.0));
}

`;
