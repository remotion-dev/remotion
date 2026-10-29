import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const FISHEYE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params { centerAndLens: vec4f, zoomAndAspect: vec4f, }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let center = params.centerAndLens.xy;
  let fieldOfView = params.centerAndLens.z;
  let radius = params.centerAndLens.w;
  let zoom = params.zoomAndAspect.x;
  let aspect = params.zoomAndAspect.y;
  let toCenter = input.uv - center;
  let corrected = vec2f(toCenter.x * aspect, toCenter.y);
  let dist = length(corrected);
  let r = dist / max(radius, 0.0001);
  if (r > 1.0 || fieldOfView <= 0.0001) {
    return textureSampleLevel(source, sourceSampler, input.uv, 0);
  }
  let halfFov = fieldOfView * 0.5;
  let warped = tan(r * halfFov) / tan(halfFov);
  var scale = 0.0;
  if (dist > 0.00001) { scale = warped * radius / dist; }
  let warpedAspect = corrected * scale;
  let offset = vec2f(warpedAspect.x / aspect, warpedAspect.y) / max(zoom, 0.0001);
  let uv = center + offset;
  if (any(uv < vec2f(0)) || any(uv > vec2f(1))) { return vec4f(0); }
  return textureSampleLevel(source, sourceSampler, uv, 0);
}
`;
