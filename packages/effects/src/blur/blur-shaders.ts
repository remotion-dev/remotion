// Shared GLSL sources for the separable Gaussian blur passes.
//
// The blur is implemented as a 9-tap kernel (KERNEL_HALF = 4) with the sample
// stride scaled by `uRadius` so the kernel always spans approximately
// ±uRadius pixels. Sigma is set to uRadius / 3 (the standard 3-sigma rule)
// so weights at the kernel edges are small but non-zero.
//
// The sampling direction is baked into the fragment shader as a vec2 constant
// to keep the inner loop branch-free.

export const BLUR_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const buildFs = (direction: 'horizontal' | 'vertical') => {
	const dirVec =
		direction === 'horizontal' ? 'vec2(1.0, 0.0)' : 'vec2(0.0, 1.0)';
	return /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uRadius;
uniform vec2 uTexelSize;

const int KERNEL_HALF = 4;
const vec2 DIRECTION = ${dirVec};

void main() {
	if (uRadius <= 0.0) {
		fragColor = texture(uSource, vUv);
		return;
	}

	float pixelStride = uRadius / float(KERNEL_HALF);
	float sigma = uRadius / 3.0;
	float twoSigmaSq = 2.0 * sigma * sigma;

	vec4 sum = vec4(0.0);
	float weightSum = 0.0;

	for (int i = -KERNEL_HALF; i <= KERNEL_HALF; ++i) {
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

export const BLUR_FS_HORIZONTAL = buildFs('horizontal');
export const BLUR_FS_VERTICAL = buildFs('vertical');
