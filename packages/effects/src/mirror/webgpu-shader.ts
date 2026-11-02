import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const MIRROR_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params { values: vec4f, }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  var uv = vec2f(input.uv.x, 1.0 - input.uv.y);
  let vertical = params.values.y != 0.0;
  let coord = select(uv.x, uv.y, vertical);
  let position = params.values.x;
  let shouldMirror = select(coord > position, coord < position, params.values.z != 0.0);
  if (shouldMirror) {
    let mirrored = 2.0 * position - coord;
    if (vertical) { uv.y = mirrored; } else { uv.x = mirrored; }
  }
  return textureSampleLevel(source, sourceSampler, clamp(vec2f(uv.x, 1.0 - uv.y), vec2f(0), vec2f(1)), 0);
}
`;
