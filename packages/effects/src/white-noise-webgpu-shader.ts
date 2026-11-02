import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const WHITE_NOISE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, amount: f32, seed: f32, }
fn random(co: vec2f) -> f32 {
  return fract(sin(dot(co, vec2f(12.9898, 78.233)) + params.seed * 37.719) * 43758.5453);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
  let noise = random(vec2f(input.position.x, params.size.y - input.position.y));
  var rgb = vec3f(0);
  if (color.a != 0.0) { rgb = color.rgb / color.a; }
  return vec4f(mix(rgb, vec3f(noise), params.amount) * color.a, color.a);
}

`;
