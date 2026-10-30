import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const STARBURST_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var palette: texture_2d<f32>;
struct Params {
 geometry: vec4f,
 values: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}
fn glslModulo(value: f32, divisor: f32) -> f32 { return value - divisor * floor(value / divisor); }
fn paletteColor(index: f32) -> vec4f { return textureLoad(palette, vec2i(i32(index), 0), 0); }

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 var center = vec2f(input.position.x, params.geometry.y - input.position.y) / params.geometry.xy - params.values.zw;
 center.x *= params.geometry.x / params.geometry.y;
 let angle = atan2(center.y, center.x) + params.values.x;
 let normalizedAngle = (angle + 3.14159265359) / (2.0 * 3.14159265359);
 let sector = normalizedAngle * params.geometry.z;
 let rayIndex = glslModulo(floor(sector), params.geometry.z);
 let colorIndex = glslModulo(rayIndex, params.geometry.w);
 var col = paletteColor(colorIndex).rgb;
 let fractSector = fract(sector);
 let edgeSmooth = params.values.y * 0.5;
 let nextColorIndex = glslModulo(rayIndex + 1.0, params.geometry.w);
 let nextCol = paletteColor(nextColorIndex).rgb;
 let blend = smoothstep(1.0 - edgeSmooth, 1.0, fractSector);
 col = mix(col, nextCol, blend);
 let blendStart = smoothstep(edgeSmooth, 0.0, fractSector);
 let prevColorIndex = glslModulo(rayIndex - 1.0 + params.geometry.w, params.geometry.w);
 let prevCol = paletteColor(prevColorIndex).rgb;
 col = mix(col, prevCol, blendStart);
 return vec4f(col, 1.0);

}
`;
