export const CHROMATIC_ABERRATION_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const CHROMATIC_ABERRATION_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uOffset;

void main() {
	vec4 redSample = texture(uSource, vUv - uOffset);
	vec4 centerSample = texture(uSource, vUv);
	vec4 blueSample = texture(uSource, vUv + uOffset);

	fragColor = vec4(redSample.r, centerSample.g, blueSample.b, centerSample.a);
}
`;
