import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const LENS_BLUR_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
// Aperture geometry and highlight controls adapted from EffectCraft's blur2.rs (MIT).
// See ../../THIRD_PARTY_LICENSES.md.
struct Params {resolution: vec2f, radius: f32, shape: f32, iris: vec4f, highlights: vec4f, options: vec4f,}
const PI=3.141592653589793;
const GOLDEN_ANGLE=2.399963229728653;
fn toLinear(color: vec3f) -> vec3f {
 return mix(color/12.92,pow((color+0.055)/1.055,vec3f(2.4)),step(vec3f(0.04045),color));
}
fn toSrgb(color: vec3f) -> vec3f {
 return mix(color*12.92,1.055*pow(max(color,vec3f(0)),vec3f(1.0/2.4))-0.055,step(vec3f(0.0031308),color));
}
fn readSource(uv: vec2f) -> vec4f {
 let sampled=textureSampleLevel(source,sourceSampler,uv,0);
 if (sampled.a<=0.0) {return vec4f(0);}
 var color=sampled.rgb/sampled.a;
 let luminance=dot(color,vec3f(0.2126,0.7152,0.0722));
 if (params.options.y!=0.0) {color=toLinear(color);}
 if (luminance>=params.highlights.y) {
  let brightest=max(color.r,max(color.g,color.b));
  let highlight=mix(vec3f(brightest),color,params.highlights.z);
  color+=highlight*(4.0*params.highlights.x);
 }
 var coverage=1.0;
 if (params.highlights.w==0.0) {
  let pixel=uv*params.resolution;
  let nearEdge=clamp(pixel+0.5,vec2f(0),vec2f(1));
  let farEdge=clamp(params.resolution+0.5-pixel,vec2f(0),vec2f(1));
  coverage=nearEdge.x*nearEdge.y*farEdge.x*farEdge.y;
 }
 return vec4f(color*sampled.a,sampled.a)*coverage;
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 if (params.radius==0.0) {return textureSampleLevel(source,sourceSampler,input.uv,0);}
 var sum=vec4f(0);var total=0.0;
 for (var i=0;i<2048;i++) {
  if (f32(i)>=params.options.x) {break;}
  let angle=f32(i)*GOLDEN_ANGLE;
  var boundary=1.0;
  if (params.shape<11.0) {
   let halfSector=PI/params.shape;
   let value=angle+PI/2.0;
   let localAngle=value-floor(value/(2.0*halfSector))*(2.0*halfSector)-halfSector;
   let polygon=cos(halfSector)/cos(localAngle);
   boundary=mix(polygon,1.0,params.iris.x);
  }
  let distance=sqrt((f32(i)+0.5)/params.options.x)*boundary;
  let rotatedAngle=angle+params.iris.y;
  let offset=vec2f(cos(rotatedAngle)*params.iris.z,sin(rotatedAngle))*distance*params.radius;
  let weight=boundary*boundary;
  sum+=readSource(input.uv-offset/params.resolution)*weight;
  total+=weight;
 }
 var color=sum/total;
 if (params.options.y!=0.0 && color.a>0.0) {color=vec4f(toSrgb(color.rgb/color.a)*color.a,color.a);}
 return vec4f(clamp(color.rgb,vec3f(0),vec3f(color.a)),color.a);
}
`;
