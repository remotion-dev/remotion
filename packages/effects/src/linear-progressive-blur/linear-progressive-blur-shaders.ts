export const LINEAR_PROGRESSIVE_BLUR_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const buildLinearProgressiveBlurFs = (
	direction: 'horizontal' | 'vertical',
) => {
	const dirVec =
		direction === 'horizontal' ? 'vec2(1.0, 0.0)' : 'vec2(0.0, 1.0)';

	return /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform vec2 uStart;
uniform vec2 uEnd;
uniform float uStartBlur;
uniform float uEndBlur;

const int MIN_KERNEL_HALF = 4;
const int MAX_KERNEL_HALF = 32;
const float TARGET_SAMPLE_DISTANCE_PX = 2.0;
const vec2 DIRECTION = ${dirVec};

float progressiveRadius(vec2 uv) {
	vec2 gradient = uEnd - uStart;
	float gradientLengthSq = dot(gradient, gradient);
	if (gradientLengthSq <= 0.0000001) {
		return max(0.0, uStartBlur);
	}

	float progress = dot(uv - uStart, gradient) / gradientLengthSq;
	return max(0.0, mix(uStartBlur, uEndBlur, clamp(progress, 0.0, 1.0)));
}

void main() {
	// Public UV coordinates use top-left origin, matching canvas/CSS coordinates.
	float radius = progressiveRadius(vec2(vUv.x, 1.0 - vUv.y));
	if (radius <= 0.0) {
		fragColor = texture(uSource, vUv);
		return;
	}

	int kernelHalf = int(
		min(
			float(MAX_KERNEL_HALF),
			max(float(MIN_KERNEL_HALF), ceil(radius / TARGET_SAMPLE_DISTANCE_PX))
		)
	);
	float pixelStride = radius / float(kernelHalf);
	float sigma = max(radius / 3.0, 0.0001);
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
