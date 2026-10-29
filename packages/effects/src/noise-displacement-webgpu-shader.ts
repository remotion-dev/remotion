import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const NOISE_DISPLACEMENT_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, center: vec2f, radius: f32, strength: f32, seed: f32, grainSize: f32, passes: f32, blur: f32, feather: f32, biasDirection: f32, biasAmount: f32, }
const DISC = array<vec2f,9>(vec2f(0),vec2f(1,0),vec2f(-1,0),vec2f(0,1),vec2f(0,-1),vec2f(0.707,0.707),vec2f(-0.707,0.707),vec2f(0.707,-0.707),vec2f(-0.707,-0.707));
const DISC_W = array<f32,9>(1.0,0.7,0.7,0.7,0.7,0.5,0.5,0.5,0.5);
fn hash12(p: vec2f) -> f32 {
  var p3=fract(p.xyx*0.1031+vec3f(params.seed*0.0973));
  p3 += vec3f(dot(p3,p3.yzx+vec3f(33.33)));
  return fract((p3.x+p3.y)*p3.z);
}
fn valueNoise(p: vec2f) -> f32 {
  let i=floor(p); let f=fract(p); let u=f*f*(vec2f(3.0)-2.0*f);
  return mix(mix(hash12(i),hash12(i+vec2f(1,0)),u.x),mix(hash12(i+vec2f(0,1)),hash12(i+vec2f(1,1)),u.x),u.y);
}
fn noiseVector(p: vec2f) -> vec2f { return vec2f(valueNoise(p+vec2f(17.13,71.79)),valueNoise(p+vec2f(83.41,29.67)))*2.0-vec2f(1.0); }
fn effectMask(pixel: vec2f) -> f32 {
  let radius=params.radius*min(params.size.x,params.size.y);
  let distance=length(pixel-params.center*params.size);
  if(distance>=radius) { return 0.0; }
  if(params.feather<=0.0001) { return 1.0; }
  return 1.0-smoothstep(radius*(1.0-params.feather),radius,distance);
}
fn sampleSource(pixel: vec2f) -> vec4f { return textureSampleLevel(source,sourceSampler,clamp(pixel/params.size,vec2f(0),vec2f(1)),0); }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let pixel=input.uv*params.size;
  let mask=effectMask(pixel);
  if(mask<=0.0 || params.strength<=0.0) { return textureSampleLevel(source,sourceSampler,input.uv,0); }
  let noiseCoord=pixel/max(params.grainSize,0.001);
  let direction=params.biasDirection*3.141592653589793/180.0;
  let displacement=(noiseVector(noiseCoord)+vec2f(cos(direction),sin(direction))*params.biasAmount)*params.strength*mask;
  let passes=max(i32(params.passes),1);
  let blurRadius=params.blur*mask;
  let blurTaps=select(1,9,blurRadius>0.5);
  var color=vec4f(0); var totalWeight=0.0;
  for(var s=0;s<12;s++) {
    if(s>=passes) { break; }
    let t=select(f32(s)/f32(max(passes-1,1)),1.0,passes==1);
    let samplePixel=pixel+displacement*t;
    let passWeight=1.0-t*0.6;
    for(var b=0;b<9;b++) {
      if(b>=blurTaps) { break; }
      let weight=passWeight*DISC_W[b];
      color += sampleSource(samplePixel+DISC[b]*blurRadius)*weight;
      totalWeight += weight;
    }
  }
  return color/totalWeight;
}

`;
