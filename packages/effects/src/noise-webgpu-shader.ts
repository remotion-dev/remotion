import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const NOISE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, amount: f32, seed: f32, premultiply: f32, }
fn random(co: vec2f) -> f32 {
  var p3 = fract(co.xyx * 0.1031 + vec3f(params.seed * 0.0973));
  p3 += vec3f(dot(p3, p3.yzx + vec3f(33.33)));
  return fract((p3.x + p3.y) * p3.z);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
  if (color.a <= 0.001) { return vec4f(0); }
  let noise = random(vec2f(input.position.x, params.size.y - input.position.y)) - 0.5;
  let rgb = color.rgb / color.a;
  let layer = select(vec3f(noise), rgb * noise, params.premultiply != 0.0);
  return vec4f(clamp(rgb + layer * params.amount, vec3f(0), vec3f(1)) * color.a, color.a);
}

`;
