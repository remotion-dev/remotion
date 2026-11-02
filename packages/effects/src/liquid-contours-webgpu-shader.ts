import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const LIQUID_CONTOURS_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 noise: vec4f,
 offset: vec4f,
 first: vec4f,
 second: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}

fn hash(p: vec2f) -> f32 {
 var p3 = fract(p.xyx * 0.1031);
 p3 += vec3f(dot(p3, p3.yzx + vec3f(33.33) + vec3f(params.noise.z * 0.013)));
 return fract((p3.x + p3.y) * p3.z);
}
fn valueNoise(p: vec2f) -> f32 {
 let i = floor(p);
 let f = fract(p);
 let u = f * f * f * (f * (f * 6.0 - vec2f(15.0)) + vec2f(10.0));
 return mix(mix(hash(i), hash(i + vec2f(1, 0)), u.x), mix(hash(i + vec2f(0, 1)), hash(i + vec2f(1)), u.x), u.y);
}

fn fbm(position: vec2f) -> f32 {
 var p = position;
 var value = 0.0;
 var amplitude = 0.5;
 var total = 0.0;
 let persistence = mix(0.2, 0.58, params.noise.x);
 let rotate = mat2x2f(0.80, 0.60, -0.60, 0.80);
 for (var i = 0; i < 5; i++) {
  let octave = f32(i) / 4.0;
  let detail = mix(0.45, 1.0, params.noise.x);
  let octaveWeight = mix(1.0, 1.0 - smoothstep(0.4, 1.0, octave), 1.0 - detail);
  value += amplitude * octaveWeight * valueNoise(p);
  total += amplitude * octaveWeight;
  p = rotate * p * 2.03 + vec2f(13.17, 7.31);
  amplitude *= persistence;
 }
 return value / total;
}

fn waveAt(pixel: vec2f) -> f32 {
 let position = pixel + params.offset.xy;
 let p = position / max(params.geometry.w, 0.001) + vec2f(params.noise.z * 0.137, params.noise.z * 0.193);
 let warp = vec2f(fbm(p + vec2f(5.2, 1.3)), fbm(p + vec2f(1.7, 9.2))) - vec2f(0.5);
 let roundRotation = mat2x2f(0.7071, 0.7071, -0.7071, 0.7071);
 let roundedField = mix(valueNoise(p * 0.9), valueNoise(roundRotation * p * 0.78 + vec2f(8.3, 2.7)), 0.45);
 let detailedField = fbm(p + warp * mix(0.35, 1.8, params.noise.x));
 let detailMix = smoothstep(0.0, 1.0, params.noise.x);
 let field = mix(roundedField, detailedField, detailMix);
 let levels = max(max(params.geometry.x, params.geometry.y) / max(params.geometry.z, 0.001), 1.0);
 return sin((field * levels + params.noise.w) * 6.28318530718);

}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let pixel = vec2f(input.position.x, params.geometry.y - input.position.y);
 let wave = waveAt(pixel);
 var derivative = fwidth(wave);
 if (i32(params.geometry.y) % 2 != 0) {
  // Match WebGL's bottom-origin derivative quads on odd-height targets.
  let neighborY = select(-1.0, 1.0, i32(pixel.y) % 2 == 0);
  derivative = abs(dpdx(wave)) + abs(waveAt(pixel + vec2f(0, neighborY)) - wave);
 }
 let edgeWidth = derivative * mix(0.15, 1.4, params.noise.y);
 let selector = smoothstep(-edgeWidth, edgeWidth, wave);
 let color = mix(params.first, params.second, selector);
 return vec4f(color.rgb * color.a, color.a);

}
`;
