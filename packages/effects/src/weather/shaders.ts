// Adapted from EffectCraft's CC Rainfall / CC Snowfall, sprite shading, and
// deterministic integer hash, under the MIT license. See ../../THIRD_PARTY_LICENSES.md.
// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/effects/src/sim.rs
// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/raster/src/lib.rs
export const WEATHER_VERTEX_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform int uSnow;
uniform float uTime;
uniform uint uSeed;
uniform vec2 uOffset;
uniform float uSize;
uniform float uSizeVariation;
uniform float uSceneDepth;
uniform float uSpeed;
uniform float uSpeedVariation;
uniform float uWind;
uniform float uWindVariation;
uniform float uSpread;
uniform float uWiggleAmount;
uniform float uWiggleAmountVariation;
uniform float uWiggleFrequency;
uniform float uWiggleFrequencyVariation;
uniform vec4 uColor;
uniform float uOpacity;
uniform int uRefract;

flat out vec2 vPosition;
flat out vec2 vLine;
flat out float vRadius;
flat out vec4 vColor;

float noise(uint i, uint key) {
	uint h = i * 0x8da6b343u ^ key * 0xd8163841u ^ uSeed * 0xcb1ab31fu;
	h ^= h >> 13;
	h *= 0x5bd1e995u;
	h ^= h >> 15;
	return float(h & 0x00ffffffu) / 16777216.0;
}

float signedNoise(uint i, uint key) {
	return noise(i, key) * 2.0 - 1.0;
}

float wrap(float value, float margin, float size) {
	return -margin + mod(value + margin, size + 2.0 * margin);
}

vec4 sourcePixel(ivec2 p) {
	ivec2 size = textureSize(uSource, 0);
	if (p.x < 0 || p.y < 0 || p.x >= size.x || p.y >= size.y) {
		return vec4(0.0);
	}
	return texelFetch(uSource, ivec2(p.x, size.y - 1 - p.y), 0);
}

// Bilinear sampling with transparent borders, at pixel centers of +0.5.
vec4 sourceAt(vec2 position) {
	vec2 p = position - 0.5;
	ivec2 base = ivec2(floor(p));
	vec2 f = fract(p);
	return mix(
		mix(sourcePixel(base), sourcePixel(base + ivec2(1, 0)), f.x),
		mix(sourcePixel(base + ivec2(0, 1)), sourcePixel(base + ivec2(1, 1)), f.x),
		f.y
	);
}

void main() {
	uint i = uint(gl_InstanceID);
	float depth = 1.0 / (1.0 + noise(i, 1u) * uSceneDepth / 2500.0);
	vec2 offset = (uOffset - 0.5) * uResolution;
	vec2 position;
	vec2 line = vec2(0.0);
	float radius;
	float alpha;
	if (uSnow == 1) {
		radius = max(uSize * 0.5 * depth * (1.0 + uSizeVariation * signedNoise(i, 2u)), 0.05);
		float speed = uSpeed * (uResolution.y / 600.0) * depth * (1.0 + uSpeedVariation * signedNoise(i, 3u));
		float wind = uWind * (uResolution.y / 1200.0) * depth * (1.0 + uWindVariation * signedNoise(i, 4u))
			+ uSpread * signedNoise(i, 8u) * depth;
		float amplitude = uWiggleAmount * 2.0 * depth * (1.0 + uWiggleAmountVariation * signedNoise(i, 5u));
		float frequency = uWiggleFrequency * (1.0 + uWiggleFrequencyVariation * signedNoise(i, 6u));
		float phase = noise(i, 9u) * 6.283185307179586;
		float margin = radius + abs(amplitude) + 2.0;
		position.y = wrap(noise(i, 10u) * (uResolution.y + 2.0 * margin) + speed * uTime + offset.y, margin, uResolution.y);
		position.x = wrap(noise(i, 11u) * (uResolution.x + 2.0 * margin) + wind * uTime + offset.x, margin, uResolution.x)
			+ amplitude * sin(frequency * uTime * 6.283185307179586 + phase);
		alpha = uOpacity * (0.4 + 0.6 * depth);
	} else {
		float speed = uSpeed / 4000.0 * uResolution.y * 2.2 * depth;
		float wind = uWind / 1000.0 * uResolution.y * (1.0 + uWindVariation * signedNoise(i, 2u)) * depth
			+ uSpread * signedNoise(i, 7u) * depth;
		float length = max(speed * 0.04 * max(uSize, 0.2), 1.0);
		float horizontalLength = wind * 0.04 * max(uSize, 0.2);
		float margin = length + abs(horizontalLength) + 4.0;
		position.y = wrap(noise(i, 3u) * (uResolution.y + 2.0 * margin) + speed * uTime + offset.y, margin, uResolution.y);
		position.x = wrap(noise(i, 4u) * (uResolution.x + 2.0 * margin) + wind * uTime + offset.x, margin, uResolution.x);
		line = vec2(-horizontalLength, -length);
		radius = max(uSize * 0.6 * depth, 0.25);
		alpha = uOpacity * (0.35 + 0.65 * depth);
	}

	vec3 color = uColor.rgb;
	if (uSnow == 0 && uRefract == 1) {
		vec4 sampleColor = sourceAt(position + vec2(2.0, 0.0));
		if (sampleColor.a > 0.0) {
			vec3 straight = sampleColor.a > 0.000001 ? sampleColor.rgb / sampleColor.a : vec3(0.0);
			color *= straight * 0.6 + 0.5;
		}
	}

	vPosition = position;
	vLine = line;
	vRadius = radius;
	vColor = vec4(color, alpha * uColor.a);
	float padding = max(radius, 0.5) + 1.0;
	vec2 minimum = min(position, position + line) - padding;
	vec2 maximum = max(position, position + line) + padding;
	vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
	vec2 pixel = mix(minimum, maximum, corner);
	gl_Position = vec4(pixel.x / uResolution.x * 2.0 - 1.0, 1.0 - pixel.y / uResolution.y * 2.0, 0.0, 1.0);
}
`;

export const WEATHER_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform int uSnow;

flat in vec2 vPosition;
flat in vec2 vLine;
flat in float vRadius;
flat in vec4 vColor;
out vec4 fragColor;

void main() {
	if (vColor.a <= 0.00001) discard;
	vec2 delta = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - vPosition;
	float radius = max(vRadius, 0.5);
	float fade = min(vRadius / 0.5, 1.0);
	float coverage;
	if (uSnow == 1) {
		float distanceSquared = dot(delta, delta) / (radius * radius);
		if (distanceSquared >= 1.0) discard;
		float q = 1.0 - distanceSquared;
		coverage = q * q;
	} else {
		float lengthSquared = dot(vLine, vLine);
		float along = lengthSquared > 0.0 ? clamp(dot(delta, vLine) / lengthSquared, 0.0, 1.0) : 0.0;
		coverage = clamp(radius - length(delta - vLine * along) + 0.5, 0.0, 1.0);
	}
	float alpha = coverage * vColor.a * fade;
	if (alpha <= 0.000001) discard;
	fragColor = vec4(vColor.rgb * alpha, alpha);
}
`;

export const WEATHER_COMPOSITE_VERTEX_SHADER = /* glsl */ `#version 300 es
out vec2 vUv;

void main() {
	vUv = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
	gl_Position = vec4(vUv * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const WEATHER_COMPOSITE_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform sampler2D uWeather;
uniform int uCompositeWithOriginal;
uniform int uLighten;

in vec2 vUv;
out vec4 fragColor;

void main() {
	vec4 weather = texture(uWeather, vUv);
	if (uCompositeWithOriginal == 0) {
		fragColor = weather;
		return;
	}
	vec4 source = texture(uSource, vUv);
	if (uLighten == 1) {
		fragColor = vec4(max(source.rgb, weather.rgb), source.a + weather.a - source.a * weather.a);
	} else {
		fragColor = weather + source * (1.0 - weather.a);
	}
}
`;
