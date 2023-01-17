export const joinPoints = (
	points: [number, number][],
	{squircleFactor}: {squircleFactor: number}
) => {
	const pointsString = points
		.map(([x, y], i) => {
			const prevPoint = i === 0 ? points[points.length - 2] : points[i - 1];
			const nextPoint = i === points.length - 1 ? points[1] : points[i + 1];
			const middleOfLine = [(x + prevPoint[0]) / 2, (y + prevPoint[1]) / 2];

			if (i === 0) {
				if (squircleFactor > 0) {
					return `M ${middleOfLine[0]} ${middleOfLine[1]}`;
				}

				return `M ${x} ${y}`;
			}

			if (squircleFactor === 0) {
				return `L ${x} ${y}`;
			}

			const prevVector = [x - prevPoint[0], y - prevPoint[1]] as const;
			const nextVector = [nextPoint[0] - x, nextPoint[1] - y] as const;

			const controlPoint1 = [
				prevPoint[0] + prevVector[0] * squircleFactor * 0.5,
				prevPoint[1] + prevVector[1] * squircleFactor * 0.5,
			] as const;

			const controlPoint2 = [
				x - nextVector[0] * squircleFactor * 0.5,
				y - nextVector[1] * squircleFactor * 0.5,
			] as const;

			return `C ${controlPoint1[0]} ${controlPoint1[1]} ${controlPoint2[0]} ${controlPoint2[1]} ${middleOfLine[0]} ${middleOfLine[1]}`;
		})
		.join(' ');

	return pointsString;
};
