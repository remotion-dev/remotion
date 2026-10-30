import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const LUT_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params {domainMin: vec4f, domainMax: vec4f,}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var lut: texture_2d<f32>;
fn lookup(p: vec3u) -> vec3f {
 let size = u32(params.domainMin.w);
 let index = p.x + size * (p.y + size * p.z);
 let width = textureDimensions(lut).x;
 // The WebGL LUT is RGBA16F. Preserve its rounding before interpolation.
 return quantizeToF16(textureLoad(lut, vec2u(index % width, index / width), 0).rgb);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
 if (color.a <= 0.0) { return vec4f(0); }
 let normalized = clamp((color.rgb / color.a - params.domainMin.xyz) / (params.domainMax.xyz - params.domainMin.xyz), vec3f(0), vec3f(1));
 let position = normalized * (params.domainMin.w - 1.0);
 let lower = vec3u(floor(position));
 let upper = min(lower + vec3u(1), vec3u(u32(params.domainMin.w) - 1u));
 let fraction = fract(position);
 let c00 = mix(lookup(lower), lookup(vec3u(upper.x, lower.yz)), fraction.x);
 let c10 = mix(lookup(vec3u(lower.x, upper.y, lower.z)), lookup(vec3u(upper.xy, lower.z)), fraction.x);
 let c01 = mix(lookup(vec3u(lower.xy, upper.z)), lookup(vec3u(upper.x, lower.y, upper.z)), fraction.x);
 let c11 = mix(lookup(vec3u(lower.x, upper.yz)), lookup(upper), fraction.x);
 return vec4f(mix(mix(c00, c10, fraction.y), mix(c01, c11, fraction.y), fraction.z) * color.a, color.a);
}
`;
