import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const THERMAL_VISION_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { amount: f32, paletteLength: f32, }
@group(0) @binding(3) var palette: texture_2d<f32>;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color=textureSampleLevel(source,sourceSampler,input.uv,0);
  if(color.a<=0.001) { return vec4f(0); }
  let rgb=color.rgb/color.a;
  let luminance=dot(rgb,vec3f(0.299,0.587,0.114));
  let position=clamp(luminance,0.0,1.0)*(max(params.paletteLength,2.0)-1.0);
  let index=i32(floor(position));
  let first=textureLoad(palette,vec2i(index,0),0).rgb;
  let last=textureLoad(palette,vec2i(min(index+1,i32(params.paletteLength)-1),0),0).rgb;
  let thermal=mix(first,last,fract(position));
  return vec4f(mix(rgb,thermal,clamp(params.amount,0.0,1.0))*color.a,color.a);
}

`;
