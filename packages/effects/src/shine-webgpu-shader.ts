import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const SHINE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {resolution: vec2f, normal: vec2f, band: vec4f, intensity: vec4f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
 let dist = dot(input.uv * params.resolution - params.resolution * 0.5, params.normal) - params.band.x;
 let halo = exp(-(dist*dist)/(params.band.y*params.band.y))*params.band.w;
 let core = exp(-(dist*dist)/(params.band.z*params.band.z))*params.intensity.x;
 let intensity = clamp(halo+core, 0.0, 1.0);
 return vec4f(color.rgb * (1.0-intensity)+vec3f(intensity*color.a), color.a);
}
`;
