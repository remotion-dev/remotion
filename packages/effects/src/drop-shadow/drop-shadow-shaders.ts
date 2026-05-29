import {buildGaussianBlurFs} from '../gaussian-blur-shader.js';

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

export const DROP_SHADOW_BLUR_FS_HORIZONTAL = buildGaussianBlurFs('horizontal');
export const DROP_SHADOW_BLUR_FS_VERTICAL = buildGaussianBlurFs('vertical');

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
