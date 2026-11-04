import {WEBGPU_MULTIPASS_BINDINGS} from '../webgpu-multipass-runtime.js';

export const REGION_BLUR_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {resolution: vec2f, feather: f32, roundness: f32, corners: vec4f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let minimum = params.corners.xy * params.resolution;
 let maximum = params.corners.zw * params.resolution;
 let halfSize = (maximum - minimum) * 0.5;
 let center = (minimum + maximum) * 0.5;
 let radius = min(halfSize.x, halfSize.y) * params.roundness;
 let offset = abs(input.uv * params.resolution - center) - halfSize + vec2f(radius);
 let distance = length(max(offset, vec2f(0))) + min(max(offset.x, offset.y), 0.0) - radius;
 var mask = select(0.0, 1.0, distance <= 0.0);
 if (params.feather > 0.0) {mask = 1.0 - smoothstep(-params.feather * 0.5, params.feather * 0.5, distance);}
 return mix(textureSampleLevel(source, sourceSampler, input.uv, 0), textureSampleLevel(secondary, sourceSampler, input.uv, 0), mask);
}
`;
