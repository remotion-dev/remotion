export const COLOR_SPACE_WGSL = /* wgsl */ `
fn srgbToLinear(color: vec3f) -> vec3f {
	let lower = color / 12.92;
	let upper = pow((color + 0.055) / 1.055, vec3f(2.4));
	return mix(lower, upper, step(vec3f(0.04045), color));
}

fn linearToSrgb(color: vec3f) -> vec3f {
	let nonNegative = max(color, vec3f(0.0));
	let lower = nonNegative * 12.92;
	let upper = 1.055 * pow(nonNegative, vec3f(1.0 / 2.4)) - 0.055;
	return mix(lower, upper, step(vec3f(0.0031308), nonNegative));
}
`;

export const WHITE_BALANCE_WGSL = /* wgsl */ `
fn applyWhiteBalanceLinear(linear: vec3f, temperature: f32, tint: f32) -> vec3f {
	let temperatureOffset = vec3f(0.3, 0.0, -0.3) * temperature;
	let tintOffset = vec3f(0.15, -0.3, 0.15) * tint;
	let gains = exp2(temperatureOffset + tintOffset);
	let luminanceGain = dot(gains, vec3f(0.2126, 0.7152, 0.0722));
	return linear * gains / luminanceGain;
}
`;

export const SHADOWS_HIGHLIGHTS_WGSL = /* wgsl */ `
fn getShadowsHighlightsStops(color: vec3f, shadows: f32, highlights: f32) -> f32 {
	let luminance = dot(color, vec3f(0.2126, 0.7152, 0.0722));
	let shadowWeight = 1.0 - smoothstep(0.0, 0.6, luminance);
	let highlightWeight = smoothstep(0.4, 1.0, luminance);
	return shadows * shadowWeight * shadowWeight + highlights * highlightWeight * highlightWeight;
}
`;

export const VIBRANCE_WGSL = /* wgsl */ `
fn applyVibrance(color: vec3f, amount: f32) -> vec3f {
	let maximum = max(max(color.r, color.g), color.b);
	let minimum = min(min(color.r, color.g), color.b);
	let lightness = (maximum + minimum) * 0.5;
	let chroma = maximum - minimum;
	let saturationDenominator = 1.0 - abs(2.0 * lightness - 1.0);
	var saturation = 0.0;
	if (saturationDenominator > 0.0) {
		saturation = chroma / saturationDenominator;
	}
	if (saturation <= 0.000001) {
		return color;
	}
	var targetSaturation = saturation * (1.0 + amount);
	if (amount >= 0.0) {
		targetSaturation = saturation + amount * (1.0 - saturation);
	}
	return clamp(vec3f(lightness) + (color - vec3f(lightness)) * (targetSaturation / saturation), vec3f(0.0), vec3f(1.0));
}
`;
