export const MIRROR_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const MIRROR_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uPosition;
uniform int uDirection;
uniform bool uInvert;

void main() {
	vec2 srcUv = vUv;
	float coord = uDirection == 0 ? vUv.x : vUv.y;
	bool shouldMirror = uInvert ? coord < uPosition : coord > uPosition;

	if (shouldMirror) {
		float mirrored = 2.0 * uPosition - coord;
		if (uDirection == 0) {
			srcUv.x = mirrored;
		} else {
			srcUv.y = mirrored;
		}
	}

	fragColor = texture(uSource, clamp(srcUv, vec2(0.0), vec2(1.0)));
}
`;
