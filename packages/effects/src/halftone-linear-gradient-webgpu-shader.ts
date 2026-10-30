import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const HALFTONE_LINEAR_GRADIENT_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 stops: vec4f,
 flags: vec4f,
 color: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let center = params.geometry.xy * 0.5;
 let gridPos = vec2f(input.position.x, params.geometry.y - input.position.y) - center;
 let gridSize = max(params.flags.x, 0.001);
 let cellIndex = floor(gridPos / gridSize + vec2f(0.5));
 let gridCenter = cellIndex * gridSize;
 let canvasCenter = center + gridCenter;
 let centerUv = canvasCenter / params.geometry.xy;
 let gradientUv = vec2f(centerUv.x, 1.0 - centerUv.y);
 let stopVector = params.stops.zw - params.stops.xy;
 let stopDistance = dot(stopVector, stopVector);
 var progress = 0.0;
 if (stopDistance > 0.0) { progress = clamp(dot(gradientUv - params.stops.xy, stopVector) / stopDistance, 0.0, 1.0); }
 let dotSize = mix(params.geometry.z, params.geometry.w, progress);
 if (dotSize <= 0.01) { return vec4f(0); }
 let radius = dotSize * 0.5;
 let coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, length(gridPos - gridCenter));
 let texColor = sampleSource(clamp(centerUv, vec2f(0), vec2f(1)));
 let dotColor = select(params.color, texColor, params.flags.y != 0.0) * coverage;
 if (params.flags.y != 0.0) { return dotColor; }
 if (params.flags.z != 0.0) { return vec4f(dotColor.rgb * texColor.a + texColor.rgb * (1.0 - dotColor.a), texColor.a); }
 return dotColor + texColor * (1.0 - dotColor.a);

}
`;
