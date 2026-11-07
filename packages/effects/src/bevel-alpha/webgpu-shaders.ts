import {WEBGPU_MULTIPASS_BINDINGS} from '../webgpu-multipass-runtime.js';

export const BEVEL_ALPHA_BLUR_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
// Alpha-derived normals adapted from EffectCraft (MIT); see ../../THIRD_PARTY_LICENSES.md.
struct Params {resolution: vec2f, radius: f32, vertical: f32,}
fn decodeHeight(color: vec4f) -> f32 {return dot(color.rg,vec2f(65280,255))/65535.0;}
fn readHeight(uv: vec2f, x: f32) -> f32 {
 if (params.vertical==0.0) {return textureSampleLevel(source,sourceSampler,uv,0).a;}
 let pixel=uv*params.resolution-0.5;
 let lower=vec2i(i32(x),i32(floor(pixel.y)));
 let maximum=vec2i(params.resolution)-1;
 let a=decodeHeight(textureLoad(source,clamp(lower,vec2i(0),maximum),0));
 let b=decodeHeight(textureLoad(source,clamp(lower+vec2i(0,1),vec2i(0),maximum),0));
 return mix(a,b,fract(pixel.y));
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let radius=max(params.radius,0.0001);
 let halfKernel=i32(clamp(ceil(radius),4.0,64.0));
 let sigma=radius/3.0;
 var sum=0.0;var total=0.0;
 for (var i=-64;i<=64;i++) {
  if (abs(i)>halfKernel) {continue;}
  let offset=f32(i)*radius/f32(halfKernel);
  let weight=exp(-0.5*offset*offset/(sigma*sigma));
  let direction=select(vec2f(offset,0),vec2f(0,offset),params.vertical!=0.0);
  sum+=readHeight(input.uv+direction/params.resolution,input.position.x)*weight;
  total+=weight;
 }
 let value=floor(clamp(sum/total,0.0,1.0)*65535.0+0.5);
 return vec4f(floor(value/256.0),value-floor(value/256.0)*256.0,0,255)/255.0;
}
`;

export const BEVEL_ALPHA_SHADE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {resolution: vec2f, thickness: f32, intensity: f32, direction: vec4f, color: vec4f,}
fn heightAt(pixel: vec2i) -> f32 {
 return dot(textureLoad(secondary,clamp(pixel,vec2i(0),vec2i(params.resolution)-1),0).rg,vec2f(65280,255))/65535.0;
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let pixel=vec2i(input.position.xy);
 // The WebGL shading pass uses output pixel coordinates for texelFetch.
 // Retain that behavior for sources smaller than the output, with explicit
 // bounds because WebGPU robust texture access may clamp out-of-range loads.
 let size=vec2i(textureDimensions(source));
 let sourcePixel=vec2i(pixel.x,pixel.y+size.y-i32(params.resolution.y));
 if (any(sourcePixel<vec2i(0)) || any(sourcePixel>=size)) {return vec4f(0);}
 let color=textureLoad(source,sourcePixel,0);
 if (params.thickness==0.0 || params.intensity==0.0 || color.a==0.0) {return color;}
 let dx=(heightAt(pixel+vec2i(1,0))-heightAt(pixel-vec2i(1,0)))*0.5;
 let dy=(heightAt(pixel+vec2i(0,1))-heightAt(pixel-vec2i(0,1)))*0.5;
 let normal=normalize(vec3f(-dx*params.thickness*1.25,-dy*params.thickness*1.25,1));
 let shade=(dot(normal,params.direction.xyz)-params.direction.z)*params.intensity*2.0;
 var rgb=color.rgb;
 if (shade>0.0) {rgb+=params.color.rgb*shade*color.a;} else {rgb*=max(1.0+shade,0.0);}
 return vec4f(clamp(rgb,vec3f(0),vec3f(color.a)),color.a);
}`;
