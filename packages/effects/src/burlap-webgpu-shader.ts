import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const BURLAP_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 values: vec4f,
 color: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}
fn glslModulo(value: f32, divisor: f32) -> f32 { return value - divisor * floor(value / divisor); }

fn hash21(p: vec2f) -> f32 {
 var p3 = fract(p.xyx * vec3f(443.8975, 397.2973, 491.1871));
 p3 += vec3f(dot(p3, p3.yzx + vec3f(19.19) + vec3f(params.values.y * 0.137)));
 return fract((p3.x + p3.y) * p3.z);
}
fn valueNoise(p: vec2f) -> f32 {
 let i = floor(p);
 var f = fract(p);
 f = f * f * (vec2f(3.0) - 2.0 * f);
 let a = hash21(i);
 let b = hash21(i + vec2f(1, 0));
 let c = hash21(i + vec2f(0, 1));
 let d = hash21(i + vec2f(1, 1));
 return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
fn strand(value: f32) -> f32 {
 let centered = abs(fract(value) - 0.5);
 return 1.0 - smoothstep(0.2, 0.5, centered);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let texColor = sampleSource(vUv);
 let alpha = texColor.a;
 if (alpha <= 0.001) { return vec4f(0); }
 if (params.geometry.z <= 0.0) { return texColor; }
 // Match WebGL pixel centers without interpolated-UV rounding.
 let fragPos = vec2f(input.position.x, params.geometry.y - input.position.y);
 let strandSize = max(params.geometry.w, 0.001);
 let weave = fragPos / strandSize;
 let roughness = params.values.x;
 let seed = params.values.y;
 let rowJitter = (hash21(vec2f(floor(weave.y), 13.17)) - 0.5) * roughness * 0.28;
 let columnJitter = (hash21(vec2f(71.43, floor(weave.x))) - 0.5) * roughness * 0.28;
 let vertical = strand(weave.x + rowJitter);
 let horizontal = strand(weave.y + columnJitter);
 let cellParity = glslModulo(floor(weave.x) + floor(weave.y), 2.0);
 let overUnder = mix(vertical, horizontal, cellParity);
 let ridge = max(max(vertical, horizontal) * 0.45, overUnder * 0.75);
 let gaps = (1.0 - vertical) * (1.0 - horizontal);
 let coarse = valueNoise(fragPos / (strandSize * 7.0) + vec2f(seed * 1.7, seed * 0.6));
 let fine = valueNoise(fragPos / max(strandSize * 0.55, 0.5) + vec2f(seed * 3.1, 4.7));
 let dashH = smoothstep(0.64, 0.98, hash21(floor(vec2f(weave.x * 2.0, weave.y)) + vec2f(23.9))) * horizontal;
 let dashV = smoothstep(0.64, 0.98, hash21(floor(vec2f(weave.x, weave.y * 2.0)) + vec2f(91.4))) * vertical;
 var texture = 0.0;
 texture += (ridge - 0.42) * 0.22;
 texture -= gaps * 0.18;
 texture += (coarse - 0.5) * 0.18 * roughness;
 texture += (fine - 0.5) * 0.16 * roughness;
 texture -= (dashH + dashV) * 0.08 * roughness;
 var rgb = texColor.rgb / alpha;
 let darkFiber = clamp(-texture * 3.2 + gaps * 0.12 + (dashH + dashV) * 0.18, 0.0, 1.0);
 let shaded = mix(rgb, params.color.rgb, darkFiber * params.color.a);
 let textured = clamp(shaded * (1.0 + max(texture, 0.0) * 0.45), vec3f(0), vec3f(1));
 rgb = mix(rgb, textured, params.geometry.z);
 return vec4f(rgb * alpha, alpha);

}
`;
