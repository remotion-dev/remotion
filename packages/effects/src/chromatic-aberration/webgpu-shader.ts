import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const CHROMATIC_ABERRATION_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params { offset: vec4f, }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let red = textureSampleLevel(source, sourceSampler, input.uv - params.offset.xy, 0);
  let center = textureSampleLevel(source, sourceSampler, input.uv, 0);
  let blue = textureSampleLevel(source, sourceSampler, input.uv + params.offset.xy, 0);
  return vec4f(red.r, center.g, blue.b, center.a);
}
`;
