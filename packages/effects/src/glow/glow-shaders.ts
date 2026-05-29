import {buildGaussianBlurFs} from '../gaussian-blur-shader.js';

export const GLOW_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const GLOW_EXTRACT_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec4 uColor;
uniform float uThreshold;

void main() {
	vec4 source = texture(uSource, vUv);
	float alpha = source.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 rgb = source.rgb / alpha;
	float luminance = dot(rgb, vec3(0.299, 0.587, 0.114));
	float threshold = clamp(uThreshold, 0.0, 1.0);
	float contribution = threshold >= 1.0
		? step(1.0, luminance)
		: clamp((luminance - threshold) / max(1.0 - threshold, 0.0001), 0.0, 1.0);
	float glowAlpha = alpha * contribution * uColor.a;

	fragColor = vec4(uColor.rgb * glowAlpha, glowAlpha);
}
`;

export const GLOW_BLUR_FS_HORIZONTAL = buildGaussianBlurFs('horizontal');
export const GLOW_BLUR_FS_VERTICAL = buildGaussianBlurFs('vertical');

export const GLOW_COMPOSITE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform sampler2D uGlow;
uniform float uIntensity;

void main() {
	vec4 source = texture(uSource, vUv);
	vec4 glow = texture(uGlow, vUv) * max(uIntensity, 0.0);
	vec4 outColor = source + glow;

	fragColor = vec4(min(outColor.rgb, vec3(1.0)), min(outColor.a, 1.0));
}
`;
