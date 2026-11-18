// Adapted from EffectCraft's magnify() and bicubic sampler under the MIT license.
// https://github.com/storytold/effectcraft/blob/1786c24523a5d5a67c01ff41213b66018a69bb04/crates/effects/src/distort2.rs
// See ../../THIRD_PARTY_LICENSES.md.
export const MAGNIFY_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uMagnification;
uniform float uSize;
uniform float uFeather;
uniform float uOpacity;
uniform bool uSquare;
uniform int uScaling;
uniform bool uIsolated;

vec4 pixelAt(ivec2 p) {
	if (any(lessThan(p, ivec2(0))) || any(greaterThanEqual(p, textureSize(uSource, 0)))) {
		return vec4(0.0);
	}
	return texelFetch(uSource, p, 0);
}

vec4 cubicWeights(float t) {
	float t2 = t * t;
	float t3 = t2 * t;
	return vec4(-0.5 * t3 + t2 - 0.5 * t,
		1.5 * t3 - 2.5 * t2 + 1.0,
		-1.5 * t3 + 2.0 * t2 + 0.5 * t,
		0.5 * t3 - 0.5 * t2);
}

vec4 sampleMagnified(vec2 uv, vec2 position) {
	vec2 dimensions = vec2(textureSize(uSource, 0));
	vec2 p = uv * dimensions;
	if (uScaling == 0) return pixelAt(ivec2(floor(p)));
	if (uScaling == 2) {
		uvec2 xy = uvec2(floor(position));
		uvec2 h = (xy.x ^ (xy.y + uvec2(1048576u, 2097152u))) * 1664525u + 1013904223u;
		h = (h ^ (h >> 16u)) * 2246822519u;
		vec2 jitter = (vec2(h ^ (h >> 13u)) / 4294967295.0 - 0.5) * max(1.0 - 1.0 / uMagnification, 0.0);
		jitter.y = -jitter.y;
		vec2 q = floor(p) + jitter;
		ivec2 base = ivec2(floor(q));
		vec2 f = fract(q);
		return mix(mix(pixelAt(base), pixelAt(base + ivec2(1, 0)), f.x),
			mix(pixelAt(base + ivec2(0, 1)), pixelAt(base + ivec2(1, 1)), f.x), f.y);
	}
	vec2 q = p - 0.5;
	ivec2 base = ivec2(floor(q));
	vec4 wx = cubicWeights(fract(q.x));
	vec4 wy = cubicWeights(fract(q.y));
	vec4 color = vec4(0.0);
	for (int y = 0; y < 4; y++) {
		for (int x = 0; x < 4; x++) {
			color += pixelAt(base + ivec2(x - 1, y - 1)) * wx[x] * wy[y];
		}
	}
	float alpha = clamp(color.a, 0.0, 1.0);
	return vec4(clamp(color.rgb, vec3(0.0), vec3(alpha)), alpha);
}

void main() {
	vec4 original = texture(uSource, vUv);
	vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
	vec2 offset = (uv - uCenter) * uResolution;
	float distance = uSquare ? max(abs(offset.x), abs(offset.y)) : length(offset);
	float weight = 0.0;
	if (uSize > 0.0) {
		weight = uFeather > 0.0
			? 1.0 - smoothstep(uSize - uFeather, uSize, distance)
			: clamp(uSize - distance + 0.5, 0.0, 1.0);
	}
	weight *= uOpacity;
	if (weight <= 0.0) {
		fragColor = uIsolated ? vec4(0.0) : original;
		return;
	}
	vec2 sourceUv = uCenter + offset / (uResolution * uMagnification);
	vec4 magnified = uMagnification == 1.0 ? original
		: sampleMagnified(vec2(sourceUv.x, 1.0 - sourceUv.y), uv * uResolution);
	fragColor = uIsolated ? magnified * weight : mix(original, magnified, weight);
}
`;
