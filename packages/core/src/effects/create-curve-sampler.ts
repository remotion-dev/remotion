// Shared by the Curves renderer and Studio so the graph matches the pixels.
// Points are validated by the effect: at least two, with increasing inputs.
export const createCurveSampler = (
	points: readonly (readonly [number, number])[],
	interpolation: 'smooth' | 'linear',
): ((input: number) => number) => {
	// Parameterize by distance along the graph so a steep segment gets room
	// to bend, even when its input values are close together.
	const distances = points
		.slice(1)
		.map((point, index) =>
			Math.hypot(point[0] - points[index][0], point[1] - points[index][1]),
		);
	const tangents = points.map(() => [0, 0]);
	if (interpolation === 'smooth' && points.length > 2) {
		for (let axis = 0; axis < 2; axis++) {
			const slopes = distances.map(
				(distance, index) =>
					(points[index + 1][axis] - points[index][axis]) / distance,
			);
			const curvatures = new Array<number>(points.length).fill(0);
			const upper = new Array<number>(points.length).fill(0);
			// Solve the natural cubic spline for each coordinate.
			for (let index = 1; index < points.length - 1; index++) {
				const diagonal =
					2 * (distances[index - 1] + distances[index]) -
					distances[index - 1] * upper[index - 1];
				upper[index] = distances[index] / diagonal;
				curvatures[index] =
					(6 * (slopes[index] - slopes[index - 1]) -
						distances[index - 1] * curvatures[index - 1]) /
					diagonal;
			}

			for (let index = points.length - 2; index > 0; index--) {
				curvatures[index] -= upper[index] * curvatures[index + 1];
			}

			for (let index = 0; index < points.length; index++) {
				tangents[index][axis] =
					index === 0
						? slopes[0] - (distances[0] * curvatures[1]) / 6
						: slopes[index - 1] +
							(distances[index - 1] *
								(curvatures[index - 1] + 2 * curvatures[index])) /
								6;
			}
		}

		for (let index = 0; index < points.length; index++) {
			// Keep both Bezier handles within their segment's input range so
			// the curve never doubles back and every input has one output.
			const maxTangent =
				3 *
				Math.min(
					index === 0
						? Infinity
						: (points[index][0] - points[index - 1][0]) / distances[index - 1],
					index === points.length - 1
						? Infinity
						: (points[index + 1][0] - points[index][0]) / distances[index],
				);
			if (tangents[index][0] > maxTangent) {
				tangents[index][1] *= maxTangent / tangents[index][0];
			}

			tangents[index][0] = Math.max(
				0,
				Math.min(maxTangent, tangents[index][0]),
			);
		}
	}

	return (input) => {
		if (input <= points[0][0]) return points[0][1];
		if (input >= points[points.length - 1][0]) {
			return points[points.length - 1][1];
		}

		const index = points.findIndex((point) => point[0] > input) - 1;
		const start = points[index];
		const end = points[index + 1];
		if (input === start[0]) return start[1];
		if (interpolation === 'linear' || points.length === 2) {
			return (
				start[1] +
				(end[1] - start[1]) * ((input - start[0]) / (end[0] - start[0]))
			);
		}

		const handleLength = distances[index] / 3;
		const firstX = start[0] + handleLength * tangents[index][0];
		const secondX = end[0] - handleLength * tangents[index + 1][0];
		let low = 0;
		let high = 1;
		// Invert the monotonic Bezier input coordinate before sampling output.
		for (let iteration = 0; iteration < 32; iteration++) {
			const candidate = (low + high) / 2;
			const inverse = 1 - candidate;
			const x =
				inverse ** 3 * start[0] +
				3 * inverse ** 2 * candidate * firstX +
				3 * inverse * candidate ** 2 * secondX +
				candidate ** 3 * end[0];
			if (x < input) low = candidate;
			else high = candidate;
		}

		const progress = (low + high) / 2;
		const remaining = 1 - progress;
		const firstY = start[1] + handleLength * tangents[index][1];
		const secondY = end[1] - handleLength * tangents[index + 1][1];
		const value =
			remaining ** 3 * start[1] +
			3 * remaining ** 2 * progress * firstY +
			3 * remaining * progress ** 2 * secondY +
			progress ** 3 * end[1];
		return Math.max(0, Math.min(1, value));
	};
};
