import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const ZIGZAG_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var palette: texture_2d<f32>;
struct Params {
 geometry: vec4f,
 stripe: vec4f,
 flags: vec4f,
 wave: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}
fn glslModulo(value: f32, divisor: f32) -> f32 { return value - divisor * floor(value / divisor); }
fn paletteColor(index: f32) -> vec4f { return textureLoad(palette, vec2i(i32(index), 0), 0); }

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let texColor = sampleSource(vUv);
 let thickness = max(params.stripe.x, 0.001);
 let spacing = max(params.stripe.y, 0.001);
 let cycle = spacing * params.geometry.z;
 let centered = vec2f(input.position.x, params.geometry.y - input.position.y) - params.geometry.xy * 0.5;
 let s = sin(params.stripe.z);
 let c = cos(params.stripe.z);
 let rotated = vec2f(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
 var axis = select(rotated.x, rotated.y, params.geometry.w == 0.0);
 let waveAxis = select(rotated.y, rotated.x, params.geometry.w == 0.0);
let phase = fract(waveAxis / max(params.wave.y, 0.001));
 axis += (1.0 - abs(phase * 2.0 - 1.0) * 2.0) * params.wave.x;

 var position = glslModulo(axis + params.stripe.w, cycle);
 if (position < 0.0) { position += cycle; }
 // Snap rounding noise at exact band boundaries before choosing the palette entry.
 var stripeIndex = position / spacing;
 let nearestIndex = floor(stripeIndex + 0.5);
 if (abs(stripeIndex - nearestIndex) < 0.00001) { stripeIndex = nearestIndex; }
 let colorIndex = glslModulo(floor(stripeIndex), params.geometry.z);
 let inStripe = glslModulo(position, spacing);
 if (inStripe > thickness) { return texColor; }

 let overlay = paletteColor(colorIndex);
 let premultiplied = overlay.rgb * overlay.a;
 if (params.flags.x != 0.0) {
  return vec4f(premultiplied * texColor.a + texColor.rgb * (1.0 - overlay.a), texColor.a);
 }
 return vec4f(premultiplied + texColor.rgb * (1.0 - overlay.a), overlay.a + texColor.a * (1.0 - overlay.a));

}
`;
