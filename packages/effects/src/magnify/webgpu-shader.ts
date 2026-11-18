import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';

// Adapted from EffectCraft's magnify() and bicubic sampler under the MIT license.
// See ../../THIRD_PARTY_LICENSES.md.
export const MAGNIFY_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
	resolutionAndCenter: vec4f,
	lens: vec4f,
	modes: vec4f,
}

fn pixelAt(p: vec2i) -> vec4f {
	if (any(p < vec2i(0)) || any(p >= vec2i(textureDimensions(source)))) {
		return vec4f(0);
	}
	return textureLoad(source, p, 0);
}

fn cubicWeights(t: f32) -> vec4f {
	let t2 = t * t;
	let t3 = t2 * t;
	return vec4f(-0.5 * t3 + t2 - 0.5 * t,
		1.5 * t3 - 2.5 * t2 + 1.0,
		-1.5 * t3 + 2.0 * t2 + 0.5 * t,
		0.5 * t3 - 0.5 * t2);
}

fn sampleMagnified(uv: vec2f, position: vec2f) -> vec4f {
	let p = uv * vec2f(textureDimensions(source));
	if (params.modes.y == 0) { return pixelAt(vec2i(floor(p))); }
	if (params.modes.y == 2) {
		let xy = vec2u(floor(position));
		var h = (vec2u(xy.x) ^ (vec2u(xy.y) + vec2u(1048576u, 2097152u))) * 1664525u + 1013904223u;
		h = (h ^ (h >> vec2u(16u))) * 2246822519u;
		let jitter = (vec2f(h ^ (h >> vec2u(13u))) / 4294967295.0 - 0.5) * max(1.0 - 1.0 / params.lens.x, 0.0);
		let q = floor(p) + jitter;
		let base = vec2i(floor(q));
		let f = fract(q);
		return mix(mix(pixelAt(base), pixelAt(base + vec2i(1, 0)), f.x),
			mix(pixelAt(base + vec2i(0, 1)), pixelAt(base + vec2i(1, 1)), f.x), f.y);
	}
	let q = p - 0.5;
	let base = vec2i(floor(q));
	let wx = cubicWeights(fract(q.x));
	let wy = cubicWeights(fract(q.y));
	var color = vec4f(0);
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			color += pixelAt(base + vec2i(x - 1, y - 1)) * wx[x] * wy[y];
		}
	}
	let alpha = clamp(color.a, 0.0, 1.0);
	return vec4f(clamp(color.rgb, vec3f(0), vec3f(alpha)), alpha);
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let original = textureSampleLevel(source, sourceSampler, input.uv, 0);
	let resolution = params.resolutionAndCenter.xy;
	let center = params.resolutionAndCenter.zw;
	let offset = (input.uv - center) * resolution;
	let distance = select(length(offset), max(abs(offset.x), abs(offset.y)), params.modes.x == 1);
	let size = params.lens.y;
	let feather = params.lens.z;
	var weight = 0.0;
	if (size > 0) {
		if (feather > 0) {
			weight = 1.0 - smoothstep(size - feather, size, distance);
		} else {
			weight = clamp(size - distance + 0.5, 0.0, 1.0);
		}
	}
	weight *= params.lens.w;
	if (weight <= 0) {
		return select(original, vec4f(0), params.modes.z == 1);
	}
	var magnified = original;
	if (params.lens.x != 1) {
		magnified = sampleMagnified(center + offset / (resolution * params.lens.x), input.uv * resolution);
	}
	return select(mix(original, magnified, weight), magnified * weight, params.modes.z == 1);
}
`;
