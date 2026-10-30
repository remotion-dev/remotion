import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const CORNER_PIN_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {top: vec4f, bottom: vec4f,}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let p0 = params.bottom.zw; let p1 = params.bottom.xy;
 let p2 = params.top.zw; let p3 = params.top.xy;
 let dx1 = p1 - p2; let dx2 = p3 - p2; let dx3 = p0 - p1 + p2 - p3;
 var g = 0.0; var h = 0.0;
 if (abs(dx3.x) > 0.000001 || abs(dx3.y) > 0.000001) {
  let denominator = dx1.x * dx2.y - dx2.x * dx1.y;
  if (abs(denominator) < 0.000001) {return vec4f(0);}
  g = (dx3.x * dx2.y - dx2.x * dx3.y) / denominator;
  h = (dx1.x * dx3.y - dx3.x * dx1.y) / denominator;
 }
 let a = p1.x - p0.x + g * p1.x; let b = p3.x - p0.x + h * p3.x; let c = p0.x;
 let d = p1.y - p0.y + g * p1.y; let e = p3.y - p0.y + h * p3.y; let f = p0.y;
 let p = input.uv;
 let x = (e-f*h)*p.x + (c*h-b)*p.y + (b*f-c*e);
 let y = (f*g-d)*p.x + (a-c*g)*p.y + (c*d-a*f);
 let w = (d*h-e*g)*p.x + (b*g-a*h)*p.y + (a*e-b*d);
 if (abs(w) < 0.000001) {return vec4f(0);}
 let uv = vec2f(x/w, 1.0-y/w);
 if (any(uv < vec2f(0)) || any(uv > vec2f(1))) {return vec4f(0);}
 return textureSampleLevel(source, sourceSampler, uv, 0);
}
`;
