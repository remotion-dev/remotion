import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const PIXEL_DISSOLVE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { progress: f32, columns: f32, rows: f32, seed: f32, feather: f32, }

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(p.xyx * vec3f(443.8975, 397.2973, 491.1871));
  p3 += vec3f(dot(p3, p3.yzx + vec3f(19.19)));
  return fract((p3.x + p3.y) * p3.z);
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let divisions = max(vec2f(params.columns, params.rows), vec2f(1));
  let uv = vec2f(input.uv.x, 1.0 - input.uv.y);
  let cell = floor(min(uv, vec2f(1.0 - 0.000001)) * divisions + vec2f(0.00001));
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
  let noise = hash21(cell + vec2f(params.seed, params.seed * 1.618));
  let edge = max(params.feather, 0.0);
  let threshold = 1.0 - clamp(params.progress, 0.0, 1.0) * (1.0 + edge);
  var mask: f32;
  if (edge <= 0.0001) { mask = 1.0 - step(threshold, noise); }
  else { mask = 1.0 - smoothstep(threshold, threshold + edge, noise); }
  return color * mask;
}

`;
