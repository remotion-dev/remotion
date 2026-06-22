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

float cross2(vec2 a, vec2 b) {
	return a.x * b.y - a.y * b.x;
}

bool solveBilinearInverse(vec2 p, out vec2 uv) {
	vec2 a = uBottomLeft;
	vec2 b = uBottomRight - uBottomLeft;
	vec2 c = uTopLeft - uBottomLeft;
	vec2 d = uBottomLeft - uBottomRight + uTopRight - uTopLeft;
	vec2 q = p - a;

	float linearDenominator = cross2(b, c);
	if (abs(cross2(b, d)) < 0.000001) {
		if (abs(linearDenominator) < 0.000001) {
			return false;
		}

		uv.x = cross2(q, c) / linearDenominator;
		uv.y = cross2(q, b) / cross2(c, b);
		return true;
	}

	float qa = -cross2(b, d);
	float qb = cross2(q, d) - cross2(b, c);
	float qc = cross2(q, c);
	float discriminant = qb * qb - 4.0 * qa * qc;

	if (discriminant < 0.0) {
		return false;
	}

	float sqrtDiscriminant = sqrt(discriminant);
	float u1 = (-qb + sqrtDiscriminant) / (2.0 * qa);
	float u2 = (-qb - sqrtDiscriminant) / (2.0 * qa);
	float u = u1;
	if (u1 < -0.001 || u1 > 1.001) {
		u = u2;
	}

	vec2 denominator = c + d * u;
	float v = abs(denominator.x) > abs(denominator.y)
		? (q.x - b.x * u) / denominator.x
		: (q.y - b.y * u) / denominator.y;

	uv = vec2(u, v);
	return true;
}

void main() {
	vec2 sourceUv;
	if (!solveBilinearInverse(vUv, sourceUv)) {
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
