const line = (pointA: [number, number], pointB: [number, number]) => {
	const lengthX = pointB[0] - pointA[0];
	const lengthY = pointB[1] - pointA[1];
	return {
		length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
		angle: Math.atan2(lengthY, lengthX),
	};
};

const controlPoint = (
	current: [number, number],
	previous: [number, number],
	next: [number, number],
	reverse: boolean
): [number, number] => {
	const p = previous || current;
	const n = next || current;
	// The smoothing ratio
	const smoothing = 0.2;
	// Properties of the opposed-line
	const o = line(p, n);

	const angle = o.angle + (reverse ? Math.PI : 0);
	const length = o.length * smoothing;

	const x = current[0] + Math.cos(angle) * length;
	const y = current[1] + Math.sin(angle) * length;

	return [x, y];
};

export const smoothenSvgPath = (points: [number, number][]) => {
	return points.reduce(
		(acc: string, current: [number, number], i: number, a) => {
			if (i === 0) {
				return `M ${current[0]},${current[1]}`;
			}

			const [x, y] = current;

			const previous = a[i - 1];
			const twoPrevious = a[i - 2];
			const next = a[i + 1];

			const [cp1x, cp1y] = controlPoint(previous, twoPrevious, current, false);
			const [cp2x, cp2y] = controlPoint(current, previous, next, true);

			return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
		},
		''
	);
};
