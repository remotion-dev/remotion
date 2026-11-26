import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const CONTOUR_LINES_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 noise: vec4f,
 offset: vec4f,
 lineColor: vec4f,
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
 var totalAmplitude = 0.0;
 let persistence = mix(0.18, 0.58, clamp(params.noise.x, 0.0, 1.0));
 let smoothness = clamp(params.noise.y, 0.0, 1.0);
 let rotate = mat2x2f(0.80, 0.60, -0.60, 0.80);
 for (var i = 0; i < 5; i++) {
  let octave = f32(i) / 4.0;
  let detailWeight = mix(1.0, 1.0 - smoothstep(0.15, 1.0, octave), smoothness);
  value += amplitude * detailWeight * valueNoise(p);
  totalAmplitude += amplitude * detailWeight;
  p = rotate * p * 2.04 + vec2f(13.17, 7.31);
  amplitude *= persistence;
 }
 return value / totalAmplitude;
}

fn contourAt(pixel: vec2f) -> f32 {
 let pixelPosition = pixel + params.offset.xy;
 let scale = max(params.geometry.w, 0.001);
 let p = pixelPosition / scale + vec2f(params.noise.z * 0.137, params.noise.z * 0.193);
 let complexity = clamp(params.noise.x, 0.0, 1.0);
 let smoothness = clamp(params.noise.y, 0.0, 1.0);
 let warp = vec2f(fbm(p + vec2f(5.2, 1.3)), fbm(p + vec2f(1.7, 9.2))) - vec2f(0.5);
 let terrain = fbm(p + warp * complexity * mix(2.8, 1.2, smoothness));
 let levels = max(max(effectGeometry.contentRect.z, effectGeometry.contentRect.w) / (max(params.geometry.z, 0.001) * 2.0), 1.0);
 return terrain * levels;

}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let texColor = sampleSource(vUv);
 let pixel = texturePixelToElementPixelBottomLeft(vec2f(input.position.x, params.geometry.y - input.position.y), params.geometry.y);
 let contourPosition = contourAt(pixel);
 let contourFraction = fract(contourPosition);
 let distanceToContour = min(contourFraction, 1.0 - contourFraction);
 var derivatives = abs(vec2f(dpdx(contourPosition), dpdy(contourPosition)));
 // Match the element's original WebGL derivative quads, measured bottom-up.
 let parity = vec2i(floor(pixel)) & vec2i(1);
 let targetParity = vec2i(floor(input.position.xy)) & vec2i(1);
 if (parity.x != targetParity.x) {
  let neighbor = pixel + vec2f(f32(1 - 2 * parity.x), 0);
  derivatives.x = abs(contourAt(neighbor) - contourPosition);
 }
 if (parity.y == targetParity.y) {
  let neighbor = pixel + vec2f(0, f32(1 - 2 * parity.y));
  derivatives.y = abs(contourAt(neighbor) - contourPosition);
 }
 var derivative = derivatives.x + derivatives.y;
 derivative = max(derivative, 0.0001);
 let halfLineWidth = max(params.noise.w, 0.001) * 0.5 * derivative;
 let coverage = 1.0 - smoothstep(halfLineWidth, halfLineWidth + derivative, distanceToContour);
 let lineAlpha = params.lineColor.a * params.offset.z * coverage;
 let premultipliedLine = params.lineColor.rgb * lineAlpha;
 if (params.offset.w != 0.0) { return vec4f(premultipliedLine * texColor.a + texColor.rgb * (1.0 - lineAlpha), texColor.a); }
 return vec4f(premultipliedLine + texColor.rgb * (1.0 - lineAlpha), lineAlpha + texColor.a * (1.0 - lineAlpha));

}
`;
