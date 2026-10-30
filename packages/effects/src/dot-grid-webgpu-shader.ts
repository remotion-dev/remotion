import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const DOT_GRID_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 flags: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let gridPos = vec2f(input.position.x, params.geometry.y - input.position.y) - params.geometry.xy * 0.5;
 let gridSize = max(params.geometry.w, 0.001);
 let cellIndex = floor(gridPos / gridSize + vec2f(0.5));
 let diff = gridPos - cellIndex * gridSize;
 let radius = params.geometry.z * 0.5;
 var coverage = 0.0;
 if (radius > 0.005) { coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, length(diff)); }
 if (params.flags.x != 0.0) { coverage = 1.0 - coverage; }
 return sampleSource(vUv) * coverage;

}
`;
