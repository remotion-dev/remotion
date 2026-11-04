import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const CHECKERBOARD_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var palette: texture_2d<f32>;
struct Params {
 geometry: vec4f,
 grid: vec4f,
 flags: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}
fn glslModulo(value: f32, divisor: f32) -> f32 { return value - divisor * floor(value / divisor); }
fn glslModulo2(value: vec2f, divisor: f32) -> vec2f { return value - divisor * floor(value / divisor); }
fn paletteColor(index: f32) -> vec4f { return textureLoad(palette, vec2i(i32(index), 0), 0); }

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let texColor = sampleSource(vUv);
 let cellSize = max(params.geometry.w, 0.001);
 let spacing = max(params.grid.x, 0.001);
 let centered = vec2f(input.position.x, params.geometry.y - input.position.y) - params.geometry.xy * 0.5;
 let s = sin(params.grid.y);
 let c = cos(params.grid.y);
 let rotated = vec2f(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
 let position = rotated + params.grid.zw;
 var localPosition = glslModulo2(position, spacing);
 if (localPosition.x < 0.0) { localPosition.x += spacing; }
 if (localPosition.y < 0.0) { localPosition.y += spacing; }
 if (localPosition.x > cellSize || localPosition.y > cellSize) { return texColor; }
 let cell = floor(position / spacing);
 var colorIndex = glslModulo(cell.x + cell.y, params.geometry.z);
 if (colorIndex < 0.0) { colorIndex += params.geometry.z; }

 let overlay = paletteColor(colorIndex);
 let premultiplied = overlay.rgb * overlay.a;
 if (params.flags.x != 0.0) {
  return vec4f(premultiplied * texColor.a + texColor.rgb * (1.0 - overlay.a), texColor.a);
 }
 return vec4f(premultiplied + texColor.rgb * (1.0 - overlay.a), overlay.a + texColor.a * (1.0 - overlay.a));

}
`;
