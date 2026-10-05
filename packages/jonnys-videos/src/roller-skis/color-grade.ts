type Color = readonly [number, number, number];

type Grade = {
	readonly contrast: number;
	readonly saturation: number;
	readonly shadowTint: Color;
	readonly highlightTint: Color;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// A compact 3D .cube LUT lets the same look follow each source clip's trims.
const makeLut = (title: string, grade: Grade) => {
	const size = 17;
	const rows = [`TITLE "${title}"`, `LUT_3D_SIZE ${size}`];

	for (let blue = 0; blue < size; blue++) {
		for (let green = 0; green < size; green++) {
			for (let red = 0; red < size; red++) {
				const input = [red, green, blue].map((value) => value / (size - 1));
				const curved = input.map(
					(value) =>
						value + grade.contrast * (value - 0.5) * 4 * value * (1 - value),
				);
				const luma =
					curved[0] * 0.2126 + curved[1] * 0.7152 + curved[2] * 0.0722;
				const shadowWeight = 4 * luma * (1 - luma) ** 2;
				const highlightWeight = 4 * luma ** 2 * (1 - luma);
				const output = curved.map((value, channel) =>
					clamp(
						luma +
							(value - luma) * grade.saturation +
							grade.shadowTint[channel] * shadowWeight +
							grade.highlightTint[channel] * highlightWeight,
					),
				);

				rows.push(output.map((value) => value.toFixed(6)).join(' '));
			}
		}
	}

	return rows.join('\n');
};

export const studioLut = makeLut('Natural studio', {
	contrast: 0.09,
	saturation: 1.025,
	shadowTint: [-0.002, 0, 0.003],
	highlightTint: [0.002, 0.001, -0.001],
});

export const outdoorLut = makeLut('Clear alpine daylight', {
	contrast: 0.13,
	saturation: 1.055,
	shadowTint: [-0.004, 0.001, 0.006],
	highlightTint: [0.007, 0.003, -0.003],
});
