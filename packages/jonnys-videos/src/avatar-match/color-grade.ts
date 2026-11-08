const smoothstep = (low: number, high: number, value: number) => {
	const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
	return t * t * (3 - 2 * t);
};

const srgbToLinear = (value: number) =>
	value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (value: number) =>
	Math.max(
		0,
		Math.min(
			1,
			value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055,
		),
	);

const labCurve = (value: number) =>
	value > 216 / 24389 ? Math.cbrt(value) : ((24389 / 27) * value + 16) / 116;

const inverseLabCurve = (value: number) =>
	value ** 3 > 216 / 24389 ? value ** 3 : (116 * value - 16) / (24389 / 27);

const size = 33;
const rows = ['TITLE "Jonny IMG_7860 portrait match"', `LUT_3D_SIZE ${size}`];

for (let blue = 0; blue < size; blue++) {
	for (let green = 0; green < size; green++) {
		for (let red = 0; red < size; red++) {
			const rgb = [red, green, blue].map((value) => value / (size - 1));
			const luma = rgb[0] * 0.213 + rgb[1] * 0.715 + rgb[2] * 0.072;
			const chroma = Math.max(...rgb) - Math.min(...rgb);
			const neutral = 1 - smoothstep(0.045, 0.11, chroma);
			const midtones =
				smoothstep(0.12, 0.42, luma) * (1 - smoothstep(0.8, 1, luma));
			const warmth = smoothstep(0.06, 0.28, rgb[0] - rgb[2]);
			const skinExposure =
				2 **
				((0.3 - 0.18 * smoothstep(0.45, 0.62, luma)) *
					warmth *
					smoothstep(0.12, 0.25, luma));
			const linearRgb = rgb.map((value, channel) => {
				const balanced = Math.max(
					0,
					Math.min(
						1,
						luma +
							(value - luma) * 0.78 +
							neutral * midtones * [0.225, 0.258, 0.275][channel] +
							warmth * [0.075, 0.082, 0.11][channel],
					),
				);
				return Math.min(1, srgbToLinear(balanced) * skinExposure);
			});
			const sourceY =
				linearRgb[0] * 0.2126729 +
				linearRgb[1] * 0.7151522 +
				linearRgb[2] * 0.072175;
			const labY = labCurve(sourceY);
			const lightness = 116 * labY - 16;
			const skinContrast = warmth * smoothstep(0.12, 0.3, luma);
			const skinVibrance = 1 + 0.08 * skinContrast;
			const adjustedLabY =
				(Math.max(
					0,
					Math.min(100, lightness + (lightness - 63) * 0.35 * skinContrast),
				) +
					16) /
				116;
			const y = inverseLabCurve(adjustedLabY);
			const skinMatch = warmth * smoothstep(56, 69, 116 * labY - 16);
			const labX = labCurve(
				(linearRgb[0] * 0.4124564 +
					linearRgb[1] * 0.3575761 +
					linearRgb[2] * 0.1804375) /
					0.95047,
			);
			const labZ = labCurve(
				(linearRgb[0] * 0.0193339 +
					linearRgb[1] * 0.119192 +
					linearRgb[2] * 0.9503041) /
					1.08883,
			);
			const x =
				inverseLabCurve(
					adjustedLabY + (labX - labY) * (1 - 0.22 * skinMatch) * skinVibrance,
				) * 0.95047;
			const z =
				inverseLabCurve(
					adjustedLabY - (labY - labZ) * (1 - 0.18 * skinMatch) * skinVibrance,
				) * 1.08883;
			const matched =
				skinMatch === 0 && skinContrast === 0
					? linearRgb
					: [
							x * 3.2404542 - y * 1.5371385 - z * 0.4985314,
							-x * 0.969266 + y * 1.8760108 + z * 0.041556,
							x * 0.0556434 - y * 0.2040259 + z * 1.0572252,
						];
			rows.push(
				matched.map((value) => linearToSrgb(value).toFixed(6)).join(' '),
			);
		}
	}
}

export const avatarLut = rows.join('\n');
