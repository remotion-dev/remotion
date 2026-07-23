export const LIGHT_TRAIL_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const LIGHT_TRAIL_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uDirection;
uniform vec2 uTexelSize;
uniform vec4 uColor;
uniform float uDistance;
uniform float uIntensity;
uniform float uDecay;
uniform float uThreshold;
uniform int uSamples;

const int MAX_SAMPLES = 64;

float getContribution(vec4 color) {
	if (color.a <= 0.001) {
		return 0.0;
	}

	vec3 rgb = color.rgb / color.a;
	float luminance = dot(rgb, vec3(0.299, 0.587, 0.114));
	float source = max(color.a, luminance);
	float threshold = clamp(uThreshold, 0.0, 1.0);

	if (threshold >= 1.0) {
		return step(1.0, source);
	}

	return clamp((source - threshold) / max(1.0 - threshold, 0.0001), 0.0, 1.0);
}

void main() {
	vec4 source = texture(uSource, vUv);
	vec4 trail = vec4(0.0);
	float sampleCount = float(max(uSamples, 1));

	for (int i = 1; i <= MAX_SAMPLES; i++) {
		if (i > uSamples) {
			break;
		}

		float progress = float(i) / sampleCount;
		vec2 offset = uDirection * uTexelSize * uDistance * progress;
		vec4 sampleColor = texture(uSource, vUv - offset);
		float contribution = getContribution(sampleColor);
		float weight = pow(clamp(uDecay, 0.0, 1.0), float(i - 1)) * contribution;
		float alpha = sampleColor.a * uColor.a * weight;

		trail += vec4(uColor.rgb * alpha, alpha);
	}

	trail *= max(uIntensity, 0.0) / sampleCount;

	vec4 outColor = source + trail;
	fragColor = vec4(min(outColor.rgb, vec3(1.0)), min(outColor.a, 1.0));
}
`;
