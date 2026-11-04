import {WEBGPU_MULTIPASS_BINDINGS} from './webgpu-multipass-runtime.js';

export const LONG_SHADOWS_EXTEND_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {offset: vec4f,}
fn alphaAt(pixel: vec2i) -> f32 {
 let size=vec2i(textureDimensions(source));
 if (any(pixel<vec2i(0)) || any(pixel>=size)) {return 0.0;}
 return textureLoad(source,pixel,0).a;
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let pixel=(input.uv-params.offset.xy)*vec2f(textureDimensions(source))-0.5;
 let base=vec2i(floor(pixel));let fraction=fract(pixel);
 let shifted=mix(mix(alphaAt(base),alphaAt(base+vec2i(1,0)),fraction.x),mix(alphaAt(base+vec2i(0,1)),alphaAt(base+vec2i(1,1)),fraction.x),fraction.y);
 return vec4f(0,0,0,max(textureSampleLevel(source,sourceSampler,input.uv,0).a,shifted));
}
`;

export const LONG_SHADOWS_COMPOSITE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {color: vec4f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color=textureSampleLevel(source,sourceSampler,input.uv,0);
 let alpha=textureSampleLevel(secondary,sourceSampler,input.uv,0).a*params.color.a;
 return color+vec4f(params.color.rgb*alpha,alpha)*(1.0-color.a);
}`;
