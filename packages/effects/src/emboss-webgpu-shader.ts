import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const EMBOSS_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params {
  resolution: vec2f, amount: f32, size: f32,
  lineWidth: f32, depth: f32, angle: f32, lightAngle: f32,
  offset: f32, padding1: f32, padding2: f32, padding3: f32,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

fn rotation(angle: f32) -> mat2x2f {
  let c = cos(angle);
  let s = sin(angle);
  return mat2x2f(vec2f(c, -s), vec2f(s, c));
}
fn roundedBoxSdf(p: vec2f, halfSize: vec2f, radius: f32) -> f32 {
  let q = abs(p) - halfSize + vec2f(radius);
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}
fn reliefHeight(fragPos: vec2f) -> f32 {
  let size = max(params.size, 0.001);
  let lineWidth = clamp(params.lineWidth, 0.001, size * 0.85);
  var pos = rotation(params.angle) * (fragPos - params.resolution * 0.5);
  pos.x += params.offset;
  let cell = floor(pos / size);
  let local = (fract(pos / size) - vec2f(0.5)) * size;
  let cellSum = cell.x + cell.y;
  let alternate = cellSum - 2.0 * floor(cellSum / 2.0);
  let dashAngle = mix(0.78539816339, -0.78539816339, step(0.5, alternate));
  let dash = rotation(dashAngle) * local;
  let sdf = roundedBoxSdf(dash, vec2f(size * 0.36, lineWidth * 0.5), lineWidth * 0.5);
  return 1.0 - smoothstep(-1.0, 1.0, sdf);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0.0);
  let alpha = color.a;
  if (alpha <= 0.001) { return vec4f(0.0); }
  if (params.amount <= 0.0 || params.depth <= 0.0) { return color; }
  let fragPos = vec2f(input.uv.x, 1.0 - input.uv.y) * params.resolution;
  let h = reliefHeight(fragPos);
  let hLeft = reliefHeight(fragPos - vec2f(1.0, 0.0));
  let hRight = reliefHeight(fragPos + vec2f(1.0, 0.0));
  let hDown = reliefHeight(fragPos - vec2f(0.0, 1.0));
  let hUp = reliefHeight(fragPos + vec2f(0.0, 1.0));
  let normal = normalize(vec3f((hLeft - hRight) * params.depth * 3.8, (hDown - hUp) * params.depth * 3.8, 1.0));
  let light = normalize(vec3f(cos(params.lightAngle), sin(params.lightAngle), 0.7));
  let lit = dot(normal, light);
  let bevel = (lit - 0.64) * 0.72 * params.depth;
  let plateau = (h - 0.5) * 0.08 * params.depth;
  let edge = min(abs(hRight - hLeft) + abs(hUp - hDown), 1.0);
  let rgb = color.rgb / alpha;
  let shaded = clamp(rgb + vec3f(bevel + plateau - edge * 0.035 * params.depth), vec3f(0.0), vec3f(1.0));
  return vec4f(mix(rgb, shaded, params.amount) * alpha, alpha);
}
`;
