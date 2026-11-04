import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const WAVE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params { resolutionAndWave: vec4f, phaseAndDirection: vec4f, }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let resolution = params.resolutionAndWave.xy;
  let amplitude = params.resolutionAndWave.z;
  let wavelength = max(params.resolutionAndWave.w, 0.001);
  let phase = params.phaseAndDirection.x;
  var uv = input.uv;
  if (params.phaseAndDirection.y == 0.0) {
    let coord = input.uv.x * resolution.x;
    let offset = sin((coord / wavelength) * 6.28318530718 + phase) * amplitude;
    uv.y += offset / resolution.y;
  } else {
    let coord = (1.0 - input.uv.y) * resolution.y;
    let offset = sin((coord / wavelength) * 6.28318530718 + phase) * amplitude;
    uv.x -= offset / resolution.x;
  }
  return textureSampleLevel(source, sourceSampler, uv, 0);
}
`;
