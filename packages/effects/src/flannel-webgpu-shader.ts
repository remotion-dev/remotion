import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const FLANNEL_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 values: vec4f,
 base: vec4f,
 stripe: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}
fn stripe(coordinate: f32, center: f32, width: f32, softness: f32) -> f32 {
 let distanceFromCenter = abs(fract(coordinate) - center);
 let halfWidth = width * 0.5;
 return 1.0 - smoothstep(halfWidth, halfWidth + softness, distanceFromCenter);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let source = sampleSource(vUv);
 if (source.a <= 0.001 || params.geometry.z <= 0.0) { return source; }
 let pixel = vec2f(input.position.x, params.geometry.y - input.position.y);
 let plaid = pixel / max(params.geometry.w, 0.001);
 let edge = mix(0.002, 0.08, params.values.x);
 let verticalWide = stripe(plaid.x, 0.5, 0.34, edge);
 let horizontalWide = stripe(plaid.y, 0.5, 0.34, edge);
 let verticalFine = stripe(plaid.x * 2.0, 0.5, 0.07, edge * 0.5);
 let horizontalFine = stripe(plaid.y * 2.0, 0.5, 0.07, edge * 0.5);
 let bands = max(max(verticalWide, horizontalWide), max(verticalFine, horizontalFine) * 0.72);
 let crossing = max(verticalWide * horizontalWide, verticalFine * horizontalFine);
 let threadX = 0.5 + 0.5 * sin(pixel.x * 3.14159265);
 let threadY = 0.5 + 0.5 * sin(pixel.y * 3.14159265);
 let weave = (threadX - 0.5) * (threadY - 0.5) * 0.12;
 let sourceRgb = source.rgb / source.a;
 let luminance = dot(sourceRgb, vec3f(0.2126, 0.7152, 0.0722));
 var plaidColor = mix(params.base.rgb, params.stripe.rgb, bands * params.stripe.a);
 plaidColor = mix(plaidColor, params.stripe.rgb * 0.72, crossing * params.stripe.a);
 plaidColor *= mix(0.58, 1.18, luminance) + weave;
 let result = mix(sourceRgb, clamp(plaidColor, vec3f(0), vec3f(1)), params.geometry.z);
 return vec4f(result * source.a, source.a);

}
`;
