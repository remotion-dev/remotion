import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const PATTERN_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 crop: vec4f,
 gapOffset: vec4f,
 stagger: vec4f,
 origin: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}
fn glslModulo(value: f32, divisor: f32) -> f32 { return value - divisor * floor(value / divisor); }

fn getPhase(index: f32, every: f32) -> f32 {
 if (every == 0.0) { return index; }
 return glslModulo(glslModulo(index, every) + every, every);
}
struct CellSample {valid: bool, color: vec4f,}
fn sampleCell(cell: vec2f, fragPx: vec2f, cropStart: vec2f, tileSize: vec2f, pitch: vec2f, originPx: vec2f) -> CellSample {
 if (params.geometry.w == 0.0 && (cell.x < 0.0 || cell.y < 0.0)) { return CellSample(false, vec4f(0)); }
 let rowPhase = getPhase(cell.y, params.stagger.y);
 let columnPhase = getPhase(cell.x, params.stagger.w);
 let stagger = vec2f(rowPhase * params.stagger.x, columnPhase * params.stagger.z);
 let localPx = fragPx - originPx - stagger - cell * pitch;
 if (localPx.x < 0.0 || localPx.y < 0.0 || localPx.x >= tileSize.x || localPx.y >= tileSize.y) { return CellSample(false, vec4f(0)); }
 let sourcePx = cropStart + localPx / params.geometry.z;
 let sourceUv = vec2f(sourcePx.x / params.geometry.x, 1.0 - sourcePx.y / params.geometry.y);
 if (sourceUv.x < 0.0 || sourceUv.y < 0.0 || sourceUv.x > 1.0 || sourceUv.y > 1.0) { return CellSample(false, vec4f(0)); }
 return CellSample(true, sampleSource(sourceUv));
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let cropStart = params.crop.xy;
 let cropEnd = params.geometry.xy - params.crop.zw;
 let cropSize = max(cropEnd - cropStart, vec2f(0.001));
 let tileSize = max(cropSize * params.geometry.z, vec2f(0.001));
 let pitch = max(tileSize + params.gapOffset.xy, vec2f(0.001));
 let originPx = (params.origin.xy + params.gapOffset.zw) * params.geometry.xy;
 let fragPx = input.position.xy;
 var cell = floor((fragPx - originPx) / pitch);
 for (var i = 0; i < 4; i++) {
  let rowPhase = getPhase(cell.y, params.stagger.y);
  let columnPhase = getPhase(cell.x, params.stagger.w);
  let stagger = vec2f(rowPhase * params.stagger.x, columnPhase * params.stagger.z);
  let nextCell = floor((fragPx - originPx - stagger) / pitch);
  if (all(nextCell == cell)) { break; }
  cell = nextCell;
 }
 for (var y = -4; y <= 4; y++) {
  for (var x = -4; x <= 4; x++) {
   let result = sampleCell(cell + vec2f(f32(x), f32(y)), fragPx, cropStart, tileSize, pitch, originPx);
   if (result.valid) { return result.color; }
  }
 }
 return vec4f(0);

}
`;
