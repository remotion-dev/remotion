import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const LIGHT_TRAIL_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {resolution: vec2f, direction: vec2f, color: vec4f, values: vec4f, samples: vec4f,}
fn contribution(color: vec4f) -> f32 {
 if (color.a<=0.001) {return 0.0;}
 let luminance=dot(color.rgb/color.a,vec3f(0.299,0.587,0.114));
 let value=max(color.a,luminance);let threshold=clamp(params.values.w,0.0,1.0);
 if (threshold>=1.0) {return step(1.0,value);}
 return clamp((value-threshold)/max(1.0-threshold,0.0001),0.0,1.0);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color=textureSampleLevel(source,sourceSampler,input.uv,0);
 var trail=vec4f(0);let count=max(params.samples.x,1.0);
 for (var i=1; i<=64; i++) {
  if (f32(i)>params.samples.x) {break;}
  let progress=f32(i)/count;
  let offset=params.direction/params.resolution*params.values.x*progress;
  let sampled=textureSampleLevel(source,sourceSampler,input.uv-offset,0);
  let weight=pow(clamp(params.values.z,0.0,1.0),f32(i-1))*contribution(sampled);
  let alpha=sampled.a*params.color.a*weight;
  trail+=vec4f(params.color.rgb*alpha,alpha);
 }
 return min(color+trail*max(params.values.y,0.0)/count,vec4f(1));
}
`;
