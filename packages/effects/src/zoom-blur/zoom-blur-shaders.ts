export const ZOOM_BLUR_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const ZOOM_BLUR_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uAmount;
uniform int uSamples;

const int MAX_SAMPLES = 64;

void main() {
	vec2 direction = vUv - uCenter;
	float normalizedAmount = uAmount / min(uResolution.x, uResolution.y);
	vec4 color = vec4(0.0);
	float total = 0.0;

	for (int i = 0; i < MAX_SAMPLES; i++) {
		if (i >= uSamples) {
			break;
		}

		float denominator = max(float(uSamples - 1), 1.0);
		float progress = float(i) / denominator;
		vec2 sampleUv = clamp(vUv - direction * normalizedAmount * progress, 0.0, 1.0);
		color += texture(uSource, sampleUv);
		total += 1.0;
	}

	fragColor = color / total;
}
`;
