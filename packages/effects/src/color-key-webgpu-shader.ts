import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const COLOR_KEY_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}

struct Params {
  keyColor: vec3f,
  similarity: f32,
  smoothness: f32,
  spillSuppression: f32,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

fn suppressSpill(rgb: vec3f, keyColor: vec3f, amount: f32) -> vec3f {
  var color = rgb;
  if (keyColor.g > keyColor.r && keyColor.g > keyColor.b) {
    let limit = (color.r + color.b) * 0.5;
    color.g = mix(color.g, min(color.g, limit), amount);
  } else if (keyColor.r > keyColor.g && keyColor.r > keyColor.b) {
    let limit = (color.g + color.b) * 0.5;
    color.r = mix(color.r, min(color.r, limit), amount);
  } else if (keyColor.b > keyColor.r && keyColor.b > keyColor.g) {
    let limit = (color.r + color.g) * 0.5;
    color.b = mix(color.b, min(color.b, limit), amount);
  }
  return color;
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  let texColor = textureSampleLevel(source, sourceSampler, input.uv, 0);
  let alpha = texColor.a;
  if (alpha <= 0.001) { return vec4f(0); }

  let rgb = texColor.rgb / alpha;
  let distanceNormalized = distance(rgb, params.keyColor) / 1.7320508075688772;
  var keepMask: f32;
  if (params.smoothness <= 0.0001) {
    keepMask = step(params.similarity, distanceNormalized);
  } else {
    let edge0 = max(0.0, params.similarity - params.smoothness);
    let edge1 = min(1.0, params.similarity + params.smoothness);
    if (edge1 <= edge0 + 0.0001) {
      keepMask = step(params.similarity, distanceNormalized);
    } else {
      keepMask = smoothstep(edge0, edge1, distanceNormalized);
    }
  }

  var cleanRgb = rgb;
  if (params.spillSuppression > 0.0) {
    cleanRgb = suppressSpill(rgb, params.keyColor, params.spillSuppression);
  }
  let keyedAlpha = alpha * keepMask;
  return vec4f(cleanRgb * keyedAlpha, keyedAlpha);
}
`;
