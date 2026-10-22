export const COLOR_SPACE_GLSL = /* glsl */ `
vec3 srgbToLinear(vec3 color) {
	vec3 lower = color / 12.92;
	vec3 upper = pow((color + 0.055) / 1.055, vec3(2.4));
	return mix(lower, upper, step(vec3(0.04045), color));
}

vec3 linearToSrgb(vec3 color) {
	vec3 nonNegative = max(color, vec3(0.0));
	vec3 lower = nonNegative * 12.92;
	vec3 upper = 1.055 * pow(nonNegative, vec3(1.0 / 2.4)) - 0.055;
	return mix(lower, upper, step(vec3(0.0031308), nonNegative));
}
`;

export const WHITE_BALANCE_GLSL = /* glsl */ `
vec3 applyWhiteBalanceLinear(vec3 linear, float temperature, float tint) {
	vec3 temperatureOffset = vec3(0.3, 0.0, -0.3) * temperature;
	vec3 tintOffset = vec3(0.15, -0.3, 0.15) * tint;
	vec3 gains = exp2(temperatureOffset + tintOffset);
	float luminanceGain = dot(gains, vec3(0.2126, 0.7152, 0.0722));
	return linear * gains / luminanceGain;
}
`;

export const SHADOWS_HIGHLIGHTS_GLSL = /* glsl */ `
float getShadowsHighlightsStops(
	vec3 color,
	float shadows,
	float highlights
) {
	float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float shadowWeight = 1.0 - smoothstep(0.0, 0.6, luminance);
	float highlightWeight = smoothstep(0.4, 1.0, luminance);
	shadowWeight *= shadowWeight;
	highlightWeight *= highlightWeight;
	return shadows * shadowWeight + highlights * highlightWeight;
}
`;

export const VIBRANCE_GLSL = /* glsl */ `
vec3 applyVibrance(vec3 color, float amount) {
	float maximum = max(max(color.r, color.g), color.b);
	float minimum = min(min(color.r, color.g), color.b);
	float lightness = (maximum + minimum) * 0.5;
	float chroma = maximum - minimum;
	float saturationDenominator = 1.0 - abs(2.0 * lightness - 1.0);
	float saturation = saturationDenominator <= 0.0
		? 0.0
		: chroma / saturationDenominator;

	if (saturation <= 0.000001) {
		return color;
	}

	float targetSaturation = amount >= 0.0
		? saturation + amount * (1.0 - saturation)
		: saturation * (1.0 + amount);
	return clamp(
		vec3(lightness) +
			(color - vec3(lightness)) * (targetSaturation / saturation),
		0.0,
		1.0
	);
}
`;
