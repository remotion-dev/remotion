import {WEBGPU_MULTIPASS_BINDINGS} from '../webgpu-multipass-runtime.js';

export const GLOW_EXTRACT_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {color: vec4f, values: vec4f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
 if (color.a <= 0.001) {return vec4f(0);}
 let luminance = dot(color.rgb/color.a, vec3f(0.299,0.587,0.114));
 let threshold = clamp(params.values.x,0.0,1.0);
 var contribution = step(1.0,luminance);
 if (threshold < 1.0) {contribution=clamp((luminance-threshold)/max(1.0-threshold,0.0001),0.0,1.0);}
 let alpha=color.a*contribution*params.color.a;
 return vec4f(params.color.rgb*alpha,alpha);
}
`;

export const GLOW_COMPOSITE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {values: vec4f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color=textureSampleLevel(source,sourceSampler,input.uv,0)+textureSampleLevel(secondary,sourceSampler,input.uv,0)*max(params.values.x,0.0);
 return min(color,vec4f(1));
}`;
