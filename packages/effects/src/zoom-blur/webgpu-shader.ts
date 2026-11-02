import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const ZOOM_BLUR_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params { resolutionAndCenter: vec4f, amountAndSamples: vec4f, }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let resolution = params.resolutionAndCenter.xy;
  let center = vec2f(params.resolutionAndCenter.z, 1.0 - params.resolutionAndCenter.w);
  let direction = input.uv - center;
  let amount = params.amountAndSamples.x / min(resolution.x, resolution.y);
  let samples = i32(params.amountAndSamples.y);
  var color = vec4f(0);
  var total = 0.0;
  for (var i = 0; i < 64; i++) {
    if (i >= samples) { break; }
    let denominator = max(f32(samples - 1), 1.0);
    let progress = f32(i) / denominator;
    let uv = clamp(input.uv - direction * amount * progress, vec2f(0), vec2f(1));
    color += textureSampleLevel(source, sourceSampler, uv, 0);
    total += 1.0;
  }
  return color / total;
}
`;
