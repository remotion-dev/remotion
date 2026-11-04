import {VALUE_NOISE_WEBGPU_SHADER} from '../value-noise-webgpu-shader.js';
import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const TURBULENT_DISPLACE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, offset: vec2f, amount: f32, scale: f32, complexity: f32, evolution: f32, cycle: f32, seed: u32, displacement: f32, pinning: f32, cycleEvolution: f32, }
fn noiseType() -> i32 { return 2; }
${VALUE_NOISE_WEBGPU_SHADER}
fn noiseLayer(p: vec2f,z: f32,seed: u32) -> f32 {
  if(params.cycleEvolution==0.0) { return valueNoise(vec3f(p,params.evolution+z),seed); }
  let t=params.evolution-floor(params.evolution/params.cycle)*params.cycle;
  let weight=smoothstep(0.0,1.0,t/params.cycle);
  return mix(valueNoise(vec3f(p,t+z),seed),valueNoise(vec3f(p,t-params.cycle+z),seed),weight);
}
fn turbulence(p: vec2f,channel: u32) -> f32 {
  var sum=0.0; var norm=0.0; var amplitude=1.0; var frequency=1.0;
  let falloff=select(0.5,0.3,params.displacement>=3.0 && params.displacement<=5.0);
  for(var octave=0;octave<10;octave++) {
    let weight=clamp(params.complexity-f32(octave),0.0,1.0);
    if(weight==0.0) { break; }
    let seed=(params.seed ^ 0x7d15u)+channel+u32(octave)*101u;
    sum += noiseLayer(p*frequency,f32(octave)*5.17,seed)*amplitude*weight;
    norm += amplitude*weight; amplitude *= falloff; frequency *= 2.0;
  }
  return sum/norm-0.5;
}
fn readPixel(p: vec2i) -> vec4f {
  if(any(p<vec2i(0)) || any(p>=vec2i(params.size))) { return vec4f(0); }
  let sourceSize=vec2i(textureDimensions(source));
  let sourcePixel=p+vec2i(0,sourceSize.y-i32(params.size.y));
  if(any(sourcePixel<vec2i(0)) || any(sourcePixel>=sourceSize)) { return vec4f(0); }
  return textureLoad(source,sourcePixel,0);
}
fn sampleSource(p: vec2f) -> vec4f {
  let base=vec2i(floor(p-vec2f(0.5))); let t=fract(p-vec2f(0.5));
  return mix(mix(readPixel(base),readPixel(base+vec2i(1,0)),t.x),mix(readPixel(base+vec2i(0,1)),readPixel(base+vec2i(1,1)),t.x),t.y);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  if(params.amount==0.0) { return textureSampleLevel(source,sourceSampler,input.uv,0); }
  let pixel=input.uv*params.size;
  let p=(pixel-params.offset*params.size)/params.scale;
  let mode=i32(params.displacement);
  var displacement: vec2f;
  if(mode==1 || mode==2 || mode==4 || mode==5) {
    let epsilon=0.05;
    let gradient=vec2f(turbulence(p+vec2f(epsilon,0),0u)-turbulence(p-vec2f(epsilon,0),0u),turbulence(p+vec2f(0,epsilon),0u)-turbulence(p-vec2f(0,epsilon),0u))/(2.0*epsilon);
    displacement=select(vec2f(-gradient.y,gradient.x),gradient,mode==1 || mode==4)*params.amount*0.25;
  } else if(mode==6) { displacement=vec2f(0,turbulence(p,17u)*params.amount); }
  else if(mode==7) { displacement=vec2f(turbulence(p,0u)*params.amount,0); }
  else if(mode==8) { displacement=vec2f(turbulence(p,0u)*params.amount); }
  else { displacement=vec2f(turbulence(p,0u),turbulence(p,17u))*params.amount; }
  let locked=params.pinning>=8.0;
  let pin=select(params.pinning,params.pinning-7.0,locked);
  let edge=max(1.0,min(params.size.x,params.size.y)*select(0.1,0.25,locked));
  let nearEdge=clamp((pixel-vec2f(0.5))/edge,vec2f(0),vec2f(1));
  let farEdge=clamp((params.size-vec2f(0.5)-pixel)/edge,vec2f(0),vec2f(1));
  let horizontal=min(nearEdge.x,farEdge.x); let vertical=min(nearEdge.y,farEdge.y);
  var weight=1.0;
  if(pin==1.0) { weight=min(horizontal,vertical); }
  if(pin==2.0) { weight=vertical; } if(pin==3.0) { weight=horizontal; }
  if(pin==4.0) { weight=nearEdge.x; } if(pin==5.0) { weight=nearEdge.y; }
  if(pin==6.0) { weight=farEdge.x; } if(pin==7.0) { weight=farEdge.y; }
  var sourcePixel=pixel+displacement*weight;
  if(locked) { sourcePixel=clamp(sourcePixel,vec2f(0.5),params.size-vec2f(0.5)); }
  return sampleSource(sourcePixel);
}

`;
