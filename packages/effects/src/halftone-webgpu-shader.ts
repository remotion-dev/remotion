import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const HALFTONE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 grid: vec4f,
 flags: vec4f,
 color: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let center = params.geometry.xy * 0.5;
 let d = vec2f(input.position.x, params.geometry.y - input.position.y) - center;
 let cosR = cos(params.grid.x);
 let sinR = sin(params.grid.x);
 let gridPos = vec2f(d.x * cosR + d.y * sinR, -d.x * sinR + d.y * cosR);
 let spacing = max(params.geometry.w, 0.001);
 let cellIndex = floor((gridPos + params.grid.yz) / spacing + vec2f(0.5));
 let gridCenter = cellIndex * spacing - params.grid.yz;
 let canvasPos = center + vec2f(gridCenter.x * cosR - gridCenter.y * sinR, gridCenter.x * sinR + gridCenter.y * cosR);
 let sampleUv = clamp(canvasPos / params.geometry.xy, vec2f(0), vec2f(1));
 let texColor = sampleSource(sampleUv);
 let alpha = texColor.a;
 var rgb = vec3f(0);
 if (alpha > 0.001) { rgb = texColor.rgb / alpha; }
 let lum = dot(rgb, vec3f(0.299, 0.587, 0.114));
 let lumDefault = lum * alpha + (1.0 - alpha);
 let dotScale = select(1.0 - lumDefault, lumDefault, params.flags.x != 0.0);
 if (dotScale <= 0.01) { return vec4f(0); }
 let diff = gridPos - gridCenter;
 let halfSize = params.geometry.z * 0.5;
 var coverage = 0.0;
 if (params.grid.w == 0.0) {
  let radius = halfSize * dotScale;
  coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, length(diff));
 } else if (params.grid.w == 1.0) {
  let s = params.geometry.z * dotScale * 0.5;
  coverage = (1.0 - smoothstep(s - 0.5, s + 0.5, abs(diff.x))) * (1.0 - smoothstep(s - 0.5, s + 0.5, abs(diff.y)));
 } else {
  let localTexColor = sampleSource(vUv);
  let localAlpha = localTexColor.a;
  var localRgb = vec3f(0);
  if (localAlpha > 0.001) { localRgb = localTexColor.rgb / localAlpha; }
  let localLum = dot(localRgb, vec3f(0.299, 0.587, 0.114));
  let localLumDefault = localLum * localAlpha + (1.0 - localAlpha);
  let localDotScale = select(1.0 - localLumDefault, localLumDefault, params.flags.x != 0.0);
  if (localDotScale <= 0.12) { return vec4f(0); }
  let lineHalf = params.geometry.z * dotScale * 0.5;
  if (lineHalf <= 1.0) { return vec4f(0); }
  coverage = (1.0 - smoothstep(halfSize - 0.5, halfSize + 0.5, abs(diff.x))) * (1.0 - smoothstep(lineHalf - 0.5, lineHalf + 0.5, abs(diff.y)));
 }
 return select(params.color, texColor, params.flags.y != 0.0) * coverage;

}
`;
