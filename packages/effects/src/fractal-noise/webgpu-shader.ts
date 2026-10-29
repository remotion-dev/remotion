import {VALUE_NOISE_WEBGPU_SHADER} from '../value-noise-webgpu-shader.js';
import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const FRACTAL_NOISE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, offset: vec2f, scale: f32, complexity: f32, evolution: f32, subInfluence: f32, subScaling: f32, contrast: f32, brightness: f32, amount: f32, cycle: f32, seed: u32, fractalType: f32, noiseType: f32, invert: f32, cycleEvolution: f32, }
fn noiseType() -> i32 { return i32(params.noiseType); }
${VALUE_NOISE_WEBGPU_SHADER}
fn layer(p: vec2f,z: f32,seed: u32) -> f32 {
  if(params.cycleEvolution==0.0) { return valueNoise(vec3f(p,params.evolution+z),seed); }
  let t=params.evolution-floor(params.evolution/params.cycle)*params.cycle;
  return mix(valueNoise(vec3f(p,t+z),seed),valueNoise(vec3f(p,t-params.cycle+z),seed),t/params.cycle);
}
fn shape(n: f32) -> f32 {
  let s=2.0*n-1.0;
  if(params.fractalType==1.0) { return 1.0-s*s; }
  if(params.fractalType==2.0) { return 1.0-abs(s); }
  if(params.fractalType==3.0) { return (1.0-abs(s))*(1.0-abs(s)); }
  if(params.fractalType==8.0) { let distance=clamp(abs(s)/0.12,0.0,1.0); return 1.0-distance*distance; }
  return n;
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color=textureSampleLevel(source,sourceSampler,input.uv,0);
  if(color.a==0.0 || params.amount==0.0) { return color; }
  let pixel=input.position.xy;
  let base=(pixel-params.size*0.5-params.offset)/params.scale;
  var sum=0.0; var norm=0.0; var amplitude=1.0; var frequency=1.0; var best=0.0;
  for(var octave=0;octave<20;octave++) {
    let weight=clamp(params.complexity-f32(octave),0.0,1.0);
    if(weight==0.0 || amplitude==0.0) { break; }
    var p=base*frequency;
    let z=f32(octave)*7.31;
    let seed=(params.seed ^ 0x51edu)+u32(octave);
    if(params.fractalType>=4.0 && params.fractalType<=6.0) {
      let a=layer(p*0.5,z+3.1,seed ^ 0x55u)-0.5;
      if(params.fractalType==5.0) {
        let angle=a*3.0;
        p=mat2x2f(vec2f(cos(angle),sin(angle)),vec2f(-sin(angle),cos(angle)))*p;
      } else {
        let b=layer(p*0.5,z+5.7,seed ^ 0xaau)-0.5;
        let strength=select(1.0,0.5+f32(octave)*0.35,params.fractalType==6.0);
        p += vec2f(a,b)*1.5*strength;
      }
    }
    let n=shape(layer(p,z,seed));
    best=max(best,n*amplitude*weight); sum += n*amplitude*weight; norm += amplitude*weight;
    amplitude *= params.subInfluence; frequency /= params.subScaling;
  }
  var noise=select(sum/norm,best,params.fractalType==7.0);
  noise=clamp((noise-0.5)*params.contrast+0.5+params.brightness,0.0,1.0);
  if(params.invert!=0.0) { noise=1.0-noise; }
  return vec4f(mix(color.rgb,vec3f(noise)*color.a,params.amount),color.a);
}

`;
