import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const BARREL_DISTORTION_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { amount: vec4f, }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let centered = input.uv * 2.0 - 1.0;
  var warped = centered;
  warped.x *= 1.0 + params.amount.x * centered.y * centered.y;
  warped.y *= 1.0 + params.amount.x * centered.x * centered.x;
  let uv = warped * 0.5 + 0.5;
  if (any(uv < vec2f(0)) || any(uv > vec2f(1))) { return vec4f(0); }
  return textureSampleLevel(source, sourceSampler, uv, 0);
}
`;
