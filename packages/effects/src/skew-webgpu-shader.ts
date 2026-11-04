import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const SKEW_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { resolution: vec2f, skew: vec2f, origin: vec2f, padding: vec2f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let uv = vec2f(input.uv.x, 1.0 - input.uv.y);
  let destination = (uv - params.origin) * params.resolution;
  let sourceY = destination.y - params.skew.y * destination.x;
  let sourceX = destination.x - params.skew.x * sourceY;
  let sourceUv = vec2f(sourceX, sourceY) / params.resolution + params.origin;
  if (any(sourceUv < vec2f(0.0)) || any(sourceUv > vec2f(1.0))) { return vec4f(0.0); }
  return textureSampleLevel(source, sourceSampler, vec2f(sourceUv.x, 1.0 - sourceUv.y), 0.0);
}
`;
