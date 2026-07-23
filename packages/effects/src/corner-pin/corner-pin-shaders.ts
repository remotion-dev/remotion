export const CORNER_PIN_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const CORNER_PIN_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uTopLeft;
uniform vec2 uTopRight;
uniform vec2 uBottomRight;
uniform vec2 uBottomLeft;

bool solveProjectiveInverse(vec2 p, out vec2 uv) {
	vec2 p0 = uBottomLeft;
	vec2 p1 = uBottomRight;
	vec2 p2 = uTopRight;
	vec2 p3 = uTopLeft;

	vec2 dx1 = p1 - p2;
	vec2 dx2 = p3 - p2;
	vec2 dx3 = p0 - p1 + p2 - p3;

	float g = 0.0;
	float h = 0.0;

	if (abs(dx3.x) > 0.000001 || abs(dx3.y) > 0.000001) {
		float denominator = dx1.x * dx2.y - dx2.x * dx1.y;
		if (abs(denominator) < 0.000001) {
			return false;
		}

		g = (dx3.x * dx2.y - dx2.x * dx3.y) / denominator;
		h = (dx1.x * dx3.y - dx3.x * dx1.y) / denominator;
	}

	float a = p1.x - p0.x + g * p1.x;
	float b = p3.x - p0.x + h * p3.x;
	float c = p0.x;
	float d = p1.y - p0.y + g * p1.y;
	float e = p3.y - p0.y + h * p3.y;
	float f = p0.y;

	float inverseX =
		(e - f * h) * p.x +
		(c * h - b) * p.y +
		(b * f - c * e);
	float inverseY =
		(f * g - d) * p.x +
		(a - c * g) * p.y +
		(c * d - a * f);
	float inverseW =
		(d * h - e * g) * p.x +
		(b * g - a * h) * p.y +
		(a * e - b * d);

	if (abs(inverseW) < 0.000001) {
		return false;
	}

	uv = vec2(inverseX / inverseW, inverseY / inverseW);
	return true;
}

void main() {
	vec2 sourceUv;
	if (!solveProjectiveInverse(vUv, sourceUv)) {
		fragColor = vec4(0.0);
		return;
	}

	if (
		sourceUv.x < 0.0 ||
		sourceUv.x > 1.0 ||
		sourceUv.y < 0.0 ||
		sourceUv.y > 1.0
	) {
		fragColor = vec4(0.0);
		return;
	}

	fragColor = texture(uSource, sourceUv);
}
`;
