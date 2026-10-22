export const LUT_VERTEX_SHADER = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const LUT_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler3D;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform sampler3D uLut;
uniform int uLutSize;
uniform vec3 uDomainMin;
uniform vec3 uDomainMax;

vec3 sampleLut(vec3 color) {
	vec3 normalizedColor = clamp(
		(color - uDomainMin) / (uDomainMax - uDomainMin),
		vec3(0.0),
		vec3(1.0)
	);
	vec3 position = normalizedColor * float(uLutSize - 1);
	ivec3 lower = ivec3(floor(position));
	ivec3 upper = min(lower + ivec3(1), ivec3(uLutSize - 1));
	vec3 fraction = fract(position);

	vec3 c000 = texelFetch(uLut, ivec3(lower.x, lower.y, lower.z), 0).rgb;
	vec3 c100 = texelFetch(uLut, ivec3(upper.x, lower.y, lower.z), 0).rgb;
	vec3 c010 = texelFetch(uLut, ivec3(lower.x, upper.y, lower.z), 0).rgb;
	vec3 c110 = texelFetch(uLut, ivec3(upper.x, upper.y, lower.z), 0).rgb;
	vec3 c001 = texelFetch(uLut, ivec3(lower.x, lower.y, upper.z), 0).rgb;
	vec3 c101 = texelFetch(uLut, ivec3(upper.x, lower.y, upper.z), 0).rgb;
	vec3 c011 = texelFetch(uLut, ivec3(lower.x, upper.y, upper.z), 0).rgb;
	vec3 c111 = texelFetch(uLut, ivec3(upper.x, upper.y, upper.z), 0).rgb;

	vec3 c00 = mix(c000, c100, fraction.x);
	vec3 c10 = mix(c010, c110, fraction.x);
	vec3 c01 = mix(c001, c101, fraction.x);
	vec3 c11 = mix(c011, c111, fraction.x);
	vec3 c0 = mix(c00, c10, fraction.y);
	vec3 c1 = mix(c01, c11, fraction.y);
	return mix(c0, c1, fraction.z);
}

void main() {
	vec4 sourceColor = texture(uSource, vUv);
	float alpha = sourceColor.a;

	if (alpha <= 0.0) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 straightColor = sourceColor.rgb / alpha;
	vec3 transformedColor = sampleLut(straightColor);
	fragColor = vec4(transformedColor * alpha, alpha);
}
`;
