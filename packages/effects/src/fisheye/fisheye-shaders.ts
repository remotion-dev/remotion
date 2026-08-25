export const FISHEYE_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FISHEYE_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uCenter;
uniform float uFieldOfView;
uniform float uRadius;
uniform float uZoom;
uniform float uAspect;

void main() {
	vec2 toCenter = vUv - uCenter;
	vec2 aspectCorrected = vec2(toCenter.x * uAspect, toCenter.y);

	float dist = length(aspectCorrected);
	float r = dist / max(uRadius, 0.0001);

	if (r > 1.0 || uFieldOfView <= 0.0001) {
		fragColor = vec4(0.0);
		return;
	}

	float halfFov = uFieldOfView * 0.5;
	float warped = tan(r * halfFov) / tan(halfFov);

	float scale = (dist > 0.00001) ? (warped * uRadius / dist) : 0.0;
	vec2 warpedAspect = aspectCorrected * scale;
	vec2 warpedOffset = vec2(warpedAspect.x / uAspect, warpedAspect.y);
	warpedOffset /= max(uZoom, 0.0001);

	vec2 srcUv = uCenter + warpedOffset;

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
