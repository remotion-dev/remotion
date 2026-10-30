import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const LIGHT_LEAK_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Params { size: vec2f, progress: f32, seed: f32, hue: f32, }
fn computePattern(uv: vec2f, s: f32, t: f32) -> vec3f {
  var p = uv * 0.8 + vec2f(sin(s * 1.61803) * 5.0, cos(s * 2.71828) * 5.0);
  for (var i = 1; i < 5; i++) {
    var newp = p;
    let fi = f32(i);
    let phase = s * 0.7 * fi;
    newp.x += 0.6 / fi * cos(fi * p.y + t * 0.7 + 0.3 * fi + phase) + 20.0;
    newp.y += 0.6 / fi * cos(fi * p.x + t * 0.7 + 0.3 * f32(i + 10) + phase) - 20.0 + 15.0;
    p = newp;
  }
  let v1 = 0.5 * sin(2.0 * p.x) + 0.5;
  let v2 = 0.5 * sin(2.0 * p.y) + 0.5;
  let blend = sin(p.x + p.y) * 0.5 + 0.5;
  let brightness = v1 * 0.5 + v2 * 0.5;
  return vec3f(brightness, blend, brightness * 0.6 + blend * 0.4);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let evolveProgress = min(1.0, params.progress * 2.0);
  let retractProgress = max(0.0, params.progress * 2.0 - 1.0);
  let refScale = 1.92;
  let uv = (vec2f(input.position.x, params.size.y - input.position.y) / params.size) * vec2f(refScale, refScale * params.size.y / params.size.x);
  let patA = computePattern(uv, params.seed, evolveProgress * 3.14159);
  let threshA = 1.0 - evolveProgress;
  let revealAlpha = smoothstep(threshA, threshA + 0.3, patA.z);
  let maxUv = vec2f(refScale, refScale * params.size.y / params.size.x);
  let patB = computePattern(maxUv - uv, params.seed + 42.0, retractProgress * 3.14159);
  let threshB = 1.0 - retractProgress;
  let eraseAlpha = smoothstep(threshB, threshB + 0.3, patB.z);
  let alpha = revealAlpha * (1.0 - eraseAlpha);
  var col = mix(vec3f(1.0, 0.85, 0.2), vec3f(1.0, 0.5, 0.05), patA.y) * (0.6 + 0.6 * patA.x);
  let angle = params.hue * 3.14159 / 180.0;
  let a = cos(angle);
  let b = sin(angle) * 0.57735;
  let c = (1.0 - a) / 3.0;
  let hueRot = mat3x3f(vec3f(a+c,c-b,c+b),vec3f(c+b,a+c,c-b),vec3f(c-b,c+b,a+c));
  col = clamp(hueRot * col, vec3f(0), vec3f(1));
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
  return vec4f(col * alpha, alpha) + color * (1.0 - alpha);
}

`;
