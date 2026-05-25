// GLSL for the WebGL2 wave warp: samples the source with a sine displacement.
// `horizontal` — phase along X, displacement in Y. `vertical` — phase along Y,
// displacement in X.

export const WAVE_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const WAVE_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmplitude;
uniform float uWavelength;
uniform float uPhase;
uniform int uDirection;

const float TWO_PI = 6.28318530718;

void main() {
	float wavelength = max(uWavelength, 0.001);
	vec2 srcUv = vUv;

	if (uDirection == 0) {
		float coordPx = vUv.x * uResolution.x;
		float offsetPx =
			sin((coordPx / wavelength) * TWO_PI + uPhase) * uAmplitude;
		srcUv.y -= offsetPx / uResolution.y;
	} else {
		float coordPx = vUv.y * uResolution.y;
		float offsetPx =
			sin((coordPx / wavelength) * TWO_PI + uPhase) * uAmplitude;
		srcUv.x -= offsetPx / uResolution.x;
	}

	fragColor = texture(uSource, srcUv);
}
`;
