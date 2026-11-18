import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

export const LIGHTNING_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uMask;
uniform vec4 uCore;
uniform vec4 uGlow;
uniform float uComposite;
in vec2 vUv;
out vec4 fragColor;

void main() {
	vec4 source = texture(uSource, vUv) * uComposite;
	vec2 mask = texture(uMask, vec2(vUv.x, 1.0 - vUv.y)).rg;
	float core = mask.r * uCore.a;
	float glow = mask.g * uGlow.a;
	float alpha = source.a + max(core, glow) * (1.0 - source.a);
	vec3 color = source.rgb + uCore.rgb * core + uGlow.rgb * glow;
	fragColor = vec4(min(color, vec3(alpha)), alpha);
}
`;

export const LIGHTNING_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { core: vec4f, glow: vec4f, composite: f32 }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var mask: texture_2d<f32>;

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let src = textureSampleLevel(source, sourceSampler, input.uv, 0) * params.composite;
	let coverage = textureLoad(mask, vec2i(input.position.xy), 0).rg;
	let core = coverage.r * params.core.a;
	let glow = coverage.g * params.glow.a;
	let alpha = src.a + max(core, glow) * (1.0 - src.a);
	let color = src.rgb + params.core.rgb * core + params.glow.rgb * glow;
	return vec4f(min(color, vec3f(alpha)), alpha);
}
`;
