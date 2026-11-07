import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const VIGNETTE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { shape: vec4f, color: vec4f, center: vec2f, mode: f32, padding: f32 }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0.0);
  let centered = abs(input.uv - params.center) * 2.0;
  let distanceFromCenter = mix(max(centered.x, centered.y), length(centered), params.shape.w);
  var mask: f32;
  if (params.shape.z <= 0.0001) {
    mask = select(0.0, params.shape.x, distanceFromCenter >= params.shape.y);
  } else {
    mask = smoothstep(params.shape.y, params.shape.y + params.shape.z, distanceFromCenter) * params.shape.x;
  }
  if (params.mode == 1.0) { return color * (1.0 - mask); }
  let overlayAlpha = mask * params.color.a;
  return vec4f(params.color.rgb * overlayAlpha + color.rgb * (1.0 - overlayAlpha), overlayAlpha + color.a * (1.0 - overlayAlpha));
}
`;
