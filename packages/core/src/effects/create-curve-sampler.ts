// Shared by the Curves renderer and Studio so the graph matches the pixels.
// Points are validated by the effect: at least two, with increasing inputs.
export const createCurveSampler = (
	points: readonly (readonly [number, number])[],
	interpolation: 'smooth' | 'linear',
): ((input: number) => number) => {
	const widths = points
		.slice(1)
		.map((point, index) => point[0] - points[index][0]);
	const slopes = widths.map(
		(width, index) => (points[index + 1][1] - points[index][1]) / width,
	);
	const tangents = points.map((_point, index) => {
		if (index === 0) return slopes[0];
		if (index === points.length - 1) return slopes[slopes.length - 1];

		const before = slopes[index - 1];
		const after = slopes[index];
		if (before === 0 || after === 0 || Math.sign(before) !== Math.sign(after)) {
			return 0;
		}

		// A weighted harmonic mean preserves each segment's monotonicity,
		// including the flat tangent at a change in direction.
		const firstWeight = 2 * widths[index] + widths[index - 1];
		const secondWeight = widths[index] + 2 * widths[index - 1];
		return (
			(firstWeight + secondWeight) /
			(firstWeight / before + secondWeight / after)
		);
	});

	return (input) => {
		if (input <= points[0][0]) return points[0][1];
		if (input >= points[points.length - 1][0]) {
			return points[points.length - 1][1];
		}

		const index = points.findIndex((point) => point[0] > input) - 1;
		const start = points[index][1];
		const end = points[index + 1][1];
		const width = widths[index];
		const progress = (input - points[index][0]) / width;
		if (interpolation === 'linear') {
			return start + (end - start) * progress;
		}

		const squared = progress * progress;
		const cubed = squared * progress;
		const value =
			(2 * cubed - 3 * squared + 1) * start +
			(cubed - 2 * squared + progress) * width * tangents[index] +
			(-2 * cubed + 3 * squared) * end +
			(cubed - squared) * width * tangents[index + 1];
		return Math.max(
			Math.min(start, end),
			Math.min(Math.max(start, end), value),
		);
	};
};
