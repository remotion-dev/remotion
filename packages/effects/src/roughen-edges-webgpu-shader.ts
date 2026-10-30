// Noise helpers adapted from @paper-design/shaders, Apache-2.0.
import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const ROUGHEN_EDGES_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, amount: f32, border: f32, scale: f32, seed: f32, }
@group(0) @binding(3) var noiseTexture: texture_2d<f32>;
fn sampleSource(uv: vec2f) -> vec4f { return textureSampleLevel(source,sourceSampler,clamp(vec2f(uv.x,1.0-uv.y),vec2f(0),vec2f(1)),0); }
fn sampleAlpha(uv: vec2f) -> f32 { return sampleSource(uv).a; }
fn seedOffset(salt: f32) -> vec2f {
  let seeded=params.seed+salt;
  return fract(sin(vec2f(seeded*12.9898+78.233,seeded*39.3468+11.135))*43758.5453);
}
fn randomR(p: vec2f) -> f32 {
  let uv=fract(floor(p)/100.0+vec2f(0.5));
  return textureLoad(noiseTexture,vec2i(floor(uv*vec2f(textureDimensions(noiseTexture)))),0).r;
}
fn valueNoise(st: vec2f) -> f32 {
  let i=floor(st); let f=fract(st); let u=f*f*(vec2f(3.0)-2.0*f);
  let a=randomR(i);let b=randomR(i+vec2f(1,0));let c=randomR(i+vec2f(0,1));let d=randomR(i+vec2f(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
fn fbm(point: vec2f) -> f32 {
  var n=point; var total=0.0; var amplitude=0.5;
  for(var i=0;i<4;i++) { total += valueNoise(n)*amplitude; n *= 2.03; amplitude *= 0.55; }
  return total;
}
fn edgeProximity(uv: vec2f,alpha: f32) -> f32 {
  if(params.border<=0.0) { return 0.0; }
  let reach=vec2f(max(params.border,1.0))/params.size;
  var minAlpha=alpha;var maxAlpha=alpha;
  for(var y=-1;y<=1;y++) { for(var x=-1;x<=1;x++) {
    let a=sampleAlpha(uv+vec2f(f32(x),f32(y))*reach);minAlpha=min(minAlpha,a);maxAlpha=max(maxAlpha,a);
  } }
  return smoothstep(0.02,0.35,maxAlpha-minAlpha);
}
fn alphaGradient(uv: vec2f) -> vec2f {
  let reach=vec2f(max(params.border*0.25,1.0))/params.size;
  return vec2f(sampleAlpha(uv+vec2f(reach.x,0))-sampleAlpha(uv-vec2f(reach.x,0)),sampleAlpha(uv+vec2f(0,reach.y))-sampleAlpha(uv-vec2f(0,reach.y)));
}
fn edgeNoise(uv: vec2f,salt: f32) -> f32 {
  var patternUV=uv-vec2f(0.5);
  patternUV *= vec2f(params.size.x/max(params.size.y,1.0),1.0);
  patternUV *= 7.0/max(params.scale,0.001);
  patternUV += 64.0*seedOffset(salt);
  return fbm(patternUV);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let uv=vec2f(input.uv.x,1.0-input.uv.y);
  let color=sampleSource(uv);
  if(params.amount<=0.0 || params.border<=0.0) { return color; }
  let proximity=edgeProximity(uv,color.a);
  if(proximity<=0.001) { return color; }
  let gradient=alphaGradient(uv);
  let noiseVector=vec2f(edgeNoise(uv+vec2f(0.17,0),2.0),edgeNoise(uv+vec2f(0,0.31),3.0))*2.0-vec2f(1.0);
  var direction=gradient+0.7*noiseVector;
  if(length(direction)<=0.0001) { direction=select(noiseVector,vec2f(1,0),length(noiseVector)<=0.0001); }
  direction=normalize(direction);
  let scalar=edgeNoise(uv,4.0)*2.0-1.0;
  let offset=direction*scalar*params.border/params.size;
  return mix(color,sampleSource(uv+offset),clamp(proximity*params.amount,0.0,1.0));
}

`;
