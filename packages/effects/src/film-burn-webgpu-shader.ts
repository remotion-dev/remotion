// Adapted from EffectCraft's CC Burn Film; see ../THIRD_PARTY_LICENSES.md.
import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const FILM_BURN_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, progress: f32, seed: u32, center: vec2f, }
fn lattice(point: vec3i, seed: u32) -> f32 {
  let p = bitcast<vec3u>(point);
  var h = (p.x * 0x27d4eb2du) ^ (p.y * 0x165667b1u) ^ (p.z * 0x9e3779b9u) ^ (seed * 0x85ebca6bu);
  h ^= h >> 15u; h *= 0x2c1b3c6du; h ^= h >> 12u; h *= 0x297a2d39u; h ^= h >> 15u;
  return f32(h & 65535u) / 65535.0;
}
fn valueNoise(point: vec3f, seed: u32) -> f32 {
  let cell = vec3i(floor(point));
  let t = fract(point);
  let fade = t * t * t * (t * (t * 6.0 - vec3f(15.0)) + vec3f(10.0));
  let lower = mix(mix(lattice(cell,seed),lattice(cell+vec3i(1,0,0),seed),fade.x),mix(lattice(cell+vec3i(0,1,0),seed),lattice(cell+vec3i(1,1,0),seed),fade.x),fade.y);
  let upper = mix(mix(lattice(cell+vec3i(0,0,1),seed),lattice(cell+vec3i(1,0,1),seed),fade.x),mix(lattice(cell+vec3i(0,1,1),seed),lattice(cell+vec3i(1,1,1),seed),fade.x),fade.y);
  return mix(lower,upper,fade.z);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color = textureSampleLevel(source,sourceSampler,input.uv,0);
  if (params.progress <= 0.0 || color.a == 0.0) { return color; }
  if (params.progress >= 1.0) { return vec4f(0); }
  let pixel = input.uv * params.size;
  let distanceFromCenter = length(pixel-params.center*params.size)/max(length(params.size),1.0);
  var noise = 0.0; var amplitude = 1.0; var frequency = 1.0;
  for(var octave=0;octave<4;octave++) {
    noise += valueNoise(vec3f(pixel/60.0*frequency,f32(octave)*7.31),params.seed+17u+u32(octave))*amplitude;
    amplitude *= 0.5; frequency *= 2.0;
  }
  noise /= 1.875;
  let field = noise*0.65+(1.0-min(distanceFromCenter,1.0))*0.35;
  let threshold = 1.0-params.progress*1.25;
  let band = 0.12*min(params.progress*10.0,1.0);
  if(field>threshold+band) { return vec4f(0); }
  if(field<=threshold-band*2.0) { return color; }
  let scorch = smoothstep(threshold-band*2.0,threshold,field);
  let hot = smoothstep(threshold,threshold+band,field);
  var rgb = color.rgb/color.a*(1.0-scorch*0.85);
  rgb = vec3f(rgb.r+(1.0-rgb.r)*hot*0.9,rgb.g+(0.45-rgb.g)*hot*0.9,rgb.b*(1.0-hot));
  let alpha = color.a*(1.0-hot*0.6);
  return vec4f(rgb*alpha,alpha);
}

`;
