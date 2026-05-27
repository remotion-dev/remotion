export const DROP_SHADOW_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const DROP_SHADOW_EXTRACT_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec4 uColor;
uniform float uOpacity;

void main() {
	vec4 source = texture(uSource, vUv);
	float shadowAlpha = source.a * uColor.a * clamp(uOpacity, 0.0, 1.0);

	fragColor = vec4(uColor.rgb * shadowAlpha, shadowAlpha);
}
`;

const buildBlurFs = (direction: 'horizontal' | 'vertical') => {
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

export const DROP_SHADOW_BLUR_FS_HORIZONTAL = buildBlurFs('horizontal');
export const DROP_SHADOW_BLUR_FS_VERTICAL = buildBlurFs('vertical');

export const DROP_SHADOW_COMPOSITE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform sampler2D uShadow;
uniform vec2 uOffset;
uniform vec2 uTexelSize;

void main() {
	vec4 source = texture(uSource, vUv);
	vec2 shadowUv = vUv - vec2(uOffset.x, -uOffset.y) * uTexelSize;
	vec4 shadow = vec4(0.0);

	if (
		shadowUv.x >= 0.0 &&
		shadowUv.x <= 1.0 &&
		shadowUv.y >= 0.0 &&
		shadowUv.y <= 1.0
	) {
		shadow = texture(uShadow, shadowUv);
	}

	fragColor = source + shadow * (1.0 - source.a);
}
`;
