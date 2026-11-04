// Aperture geometry and highlight controls adapted from EffectCraft's
// blur2.rs (MIT). See ../../THIRD_PARTY_LICENSES.md.
export const LENS_BLUR_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uRadius;
uniform int uIrisShape;
uniform float uIrisRoundness;
uniform float uIrisRotation;
uniform float uIrisAspectRatio;
uniform float uHighlightGain;
uniform float uHighlightThreshold;
uniform float uHighlightSaturation;
uniform bool uRepeatEdgePixels;
uniform int uSamples;
uniform bool uLinearLight;

const float PI = 3.141592653589793;
const float GOLDEN_ANGLE = 2.399963229728653;

vec3 toLinear(vec3 color) {
	return mix(color / 12.92, pow((color + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), color));
}

vec3 toSrgb(vec3 color) {
	return mix(color * 12.92, 1.055 * pow(max(color, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));
}

vec4 readSource(vec2 uv) {
	vec4 sampleColor = texture(uSource, uv);
	if (sampleColor.a <= 0.0) return vec4(0.0);
	vec3 color = sampleColor.rgb / sampleColor.a;
	float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
	if (uLinearLight) color = toLinear(color);
	if (luminance >= uHighlightThreshold) {
		float brightest = max(color.r, max(color.g, color.b));
		vec3 highlight = mix(vec3(brightest), color, uHighlightSaturation);
		color += highlight * (4.0 * uHighlightGain);
	}

	float coverage = 1.0;
	if (!uRepeatEdgePixels) {
		// The texture clamps to its edge texels. Fade their bilinear footprint
		// against transparent texels beyond the canvas instead of cutting it off.
		vec2 pixel = uv * uResolution;
		vec2 nearEdge = clamp(pixel + 0.5, 0.0, 1.0);
		vec2 farEdge = clamp(uResolution + 0.5 - pixel, 0.0, 1.0);
		coverage = nearEdge.x * nearEdge.y * farEdge.x * farEdge.y;
	}
	return vec4(color * sampleColor.a, sampleColor.a) * coverage;
}

void main() {
	// A zero radius must be an exact identity, including with highlight gain.
	if (uRadius == 0.0) {
		fragColor = texture(uSource, vUv);
		return;
	}

	vec4 sum = vec4(0.0);
	float totalWeight = 0.0;
	for (int i = 0; i < 2048; i++) {
		if (i >= uSamples) break;
		float angle = float(i) * GOLDEN_ANGLE;
		float boundary = 1.0;
		if (uIrisShape < 11) {
			float halfSector = PI / float(uIrisShape);
			float localAngle = mod(angle + PI / 2.0, 2.0 * halfSector) - halfSector;
			float polygon = cos(halfSector) / cos(localAngle);
			boundary = mix(polygon, 1.0, uIrisRoundness);
		}
		float distance = sqrt((float(i) + 0.5) / float(uSamples)) * boundary;
		float rotatedAngle = angle + uIrisRotation;
		vec2 offset = vec2(cos(rotatedAngle) * uIrisAspectRatio, -sin(rotatedAngle)) * distance * uRadius;
		// Radially mapping a disc onto a polygon changes area by boundary^2.
		// Weight by that Jacobian to keep the aperture uniformly illuminated.
		float weight = boundary * boundary;
		sum += readSource(vUv - offset / uResolution) * weight;
		totalWeight += weight;
	}

	vec4 color = sum / totalWeight;
	if (uLinearLight && color.a > 0.0) {
		color.rgb = toSrgb(color.rgb / color.a) * color.a;
	}
	// Keep the result premultiplied even when highlights exceed display white.
	fragColor = vec4(clamp(color.rgb, vec3(0.0), vec3(color.a)), color.a);
}
`;
