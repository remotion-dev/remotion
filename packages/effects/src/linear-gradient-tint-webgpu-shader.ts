import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const LINEAR_GRADIENT_TINT_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { start: vec2f, end: vec2f, startColor: vec4f, endColor: vec4f, amount: f32, padding1: f32, padding2: f32, padding3: f32 }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

fn gradientProgress(uv: vec2f) -> f32 {
  let gradient = params.end - params.start;
  let gradientLengthSq = dot(gradient, gradient);
  if (gradientLengthSq <= 0.0000001) { return 0.0; }
  return clamp(dot(uv - params.start, gradient) / gradientLengthSq, 0.0, 1.0);
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let color = textureSampleLevel(source, sourceSampler, input.uv, 0.0);
  let alpha = color.a;
  if (alpha <= 0.001) { return vec4f(0.0); }
  let tintColor = mix(params.startColor, params.endColor, gradientProgress(input.uv));
  let blended = mix(color.rgb / alpha, tintColor.rgb, params.amount * tintColor.a);
  return vec4f(blended * alpha, alpha);
}
`;
