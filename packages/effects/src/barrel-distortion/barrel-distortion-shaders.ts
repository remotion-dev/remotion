export const BARREL_DISTORTION_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const BARREL_DISTORTION_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAmount;

void main() {
	vec2 centered = vUv * 2.0 - 1.0;
	vec2 warped = centered;
	warped.x *= 1.0 + uAmount * centered.y * centered.y;
	warped.y *= 1.0 + uAmount * centered.x * centered.x;

	vec2 srcUv = warped * 0.5 + 0.5;

	if (
		srcUv.x < 0.0 ||
		srcUv.x > 1.0 ||
		srcUv.y < 0.0 ||
		srcUv.y > 1.0
	) {
		fragColor = vec4(0.0);
		return;
	}

	fragColor = texture(uSource, srcUv);
}
`;
