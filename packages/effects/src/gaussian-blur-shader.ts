export const buildGaussianBlurFs = (direction: 'horizontal' | 'vertical') => {
	const dirVec =
		direction === 'horizontal' ? 'vec2(1.0, 0.0)' : 'vec2(0.0, 1.0)';

	return /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uRadius;
uniform vec2 uTexelSize;

const int MIN_KERNEL_HALF = 4;
const int MAX_KERNEL_HALF = 32;
const float TARGET_SAMPLE_DISTANCE_PX = 2.0;
const vec2 DIRECTION = ${dirVec};

void main() {
	if (uRadius <= 0.0) {
		fragColor = texture(uSource, vUv);
		return;
	}

	int kernelHalf = int(
		min(
			float(MAX_KERNEL_HALF),
			max(float(MIN_KERNEL_HALF), ceil(uRadius / TARGET_SAMPLE_DISTANCE_PX))
		)
	);
	float pixelStride = uRadius / float(kernelHalf);
	float sigma = uRadius / 3.0;
	float twoSigmaSq = 2.0 * sigma * sigma;

	vec4 sum = vec4(0.0);
	float weightSum = 0.0;

	for (int i = -MAX_KERNEL_HALF; i <= MAX_KERNEL_HALF; ++i) {
		if (abs(i) > kernelHalf) {
			continue;
		}

		float offsetPx = float(i) * pixelStride;
		float w = exp(-(offsetPx * offsetPx) / twoSigmaSq);
		vec2 uv = vUv + DIRECTION * uTexelSize * offsetPx;
		sum += texture(uSource, uv) * w;
		weightSum += w;
	}

	fragColor = sum / weightSum;
}
`;
};
