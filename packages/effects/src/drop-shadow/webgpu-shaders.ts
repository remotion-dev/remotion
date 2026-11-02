import {WEBGPU_MULTIPASS_BINDINGS} from '../webgpu-multipass-runtime.js';

export const DROP_SHADOW_EXTRACT_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {color: vec4f, values: vec4f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let alpha=textureSampleLevel(source,sourceSampler,input.uv,0).a*params.color.a*clamp(params.values.x,0.0,1.0);
 return vec4f(params.color.rgb*alpha,alpha);
}
`;

export const DROP_SHADOW_COMPOSITE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {resolution: vec2f, offset: vec2f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color=textureSampleLevel(source,sourceSampler,input.uv,0);
 let uv=input.uv-params.offset/params.resolution;
 var shadow=vec4f(0);
 if (all(uv >= vec2f(0)) && all(uv <= vec2f(1))) {shadow=textureSampleLevel(secondary,sourceSampler,uv,0);}
 return color+shadow*(1.0-color.a);
}`;
