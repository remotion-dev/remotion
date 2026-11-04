// Alpha-derived normals and shading adapted from EffectCraft's perspective.rs
// (MIT). See ../../THIRD_PARTY_LICENSES.md.
export const BEVEL_ALPHA_VERTEX_SHADER = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const HEIGHT_ENCODING = /* glsl */ `
// Store a 16-bit height in two 8-bit channels. This avoids banded normals
// without requiring floating-point render targets or WebGL extensions.
vec4 encodeHeight(float height) {
	float value = floor(clamp(height, 0.0, 1.0) * 65535.0 + 0.5);
	return vec4(floor(value / 256.0), mod(value, 256.0), 0.0, 255.0) / 255.0;
}
float decodeHeight(vec4 value) {
	return dot(value.rg, vec2(65280.0, 255.0)) / 65535.0;
}
`;

export const buildBevelAlphaBlurShader = (
	direction: 'horizontal' | 'vertical',
) => /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uRadius;
${HEIGHT_ENCODING}
float readHeight(vec2 uv) {
	${
		direction === 'horizontal'
			? 'return texture(uSource, uv).a;'
			: `
	// Decode before interpolating: packed channel values cannot be filtered.
	vec2 pixel = uv * uResolution - 0.5;
	ivec2 lower = ivec2(int(gl_FragCoord.x), int(floor(pixel.y)));
	ivec2 maximum = ivec2(uResolution) - 1;
	float a = decodeHeight(texelFetch(uSource, clamp(lower, ivec2(0), maximum), 0));
	float b = decodeHeight(texelFetch(uSource, clamp(lower + ivec2(0, 1), ivec2(0), maximum), 0));
	return mix(a, b, fract(pixel.y));`
	}
}
void main() {
	float radius = max(uRadius, 0.0001);
	int halfKernel = int(clamp(ceil(radius), 4.0, 64.0));
	float sigma = radius / 3.0;
	float sum = 0.0;
	float total = 0.0;
	for (int i = -64; i <= 64; i++) {
		if (abs(i) > halfKernel) continue;
		float offset = float(i) * radius / float(halfKernel);
		float weight = exp(-0.5 * offset * offset / (sigma * sigma));
		vec2 uv = vUv + ${direction === 'horizontal' ? 'vec2(offset, 0.0)' : 'vec2(0.0, offset)'} / uResolution;
		sum += readHeight(uv) * weight;
		total += weight;
	}
	fragColor = encodeHeight(sum / total);
}
`;

export const BEVEL_ALPHA_SHADE_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform sampler2D uHeight;
uniform vec2 uResolution;
uniform float uEdgeThickness;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform float uLightIntensity;
${HEIGHT_ENCODING}
float heightAt(ivec2 pixel) {
	return decodeHeight(texelFetch(uHeight, clamp(pixel, ivec2(0), ivec2(uResolution) - 1), 0));
}
void main() {
	vec4 source = texelFetch(uSource, ivec2(gl_FragCoord.xy), 0);
	if (uEdgeThickness == 0.0 || uLightIntensity == 0.0 || source.a == 0.0) {
		fragColor = source;
		return;
	}
	ivec2 pixel = ivec2(gl_FragCoord.xy);
	float dx = (heightAt(pixel + ivec2(1, 0)) - heightAt(pixel - ivec2(1, 0))) * 0.5;
	// Screen-space Y points down; texture-space Y points up.
	float dy = (heightAt(pixel - ivec2(0, 1)) - heightAt(pixel + ivec2(0, 1))) * 0.5;
	vec3 normal = normalize(vec3(-dx * uEdgeThickness * 1.25, -dy * uEdgeThickness * 1.25, 1.0));
	float shade = (dot(normal, uLightDirection) - uLightDirection.z) * uLightIntensity * 2.0;
	vec3 color = source.rgb;
	if (shade > 0.0) {
		color += uLightColor * shade * source.a;
	} else {
		color *= max(1.0 + shade, 0.0);
	}
	fragColor = vec4(clamp(color, vec3(0.0), vec3(source.a)), source.a);
}
`;
