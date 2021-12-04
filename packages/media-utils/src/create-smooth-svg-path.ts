export const createSmoothSvgPath = (points: [number, number][]) => {
	return points.reduce(
		(acc: string | null, point: [number, number], i: number, a) => {
			if (i === 0) {
				return `M ${point[0]},${point[1]}`;
			}

			const p0 = a[i - 2] || a[i - 1];
			const x0 = p0[0];
			const y0 = p0[1];
			const p1 = a[i - 1];
			const x1 = p1[0];
			const y1 = p1[1];
			const x = point[0];
			const y = point[1];
			const cp1x = (2 * x0 + x1) / 3;
			const cp1y = (2 * y0 + y1) / 3;
			const cp2x = (x0 + 2 * x1) / 3;
			const cp2y = (y0 + 2 * y1) / 3;
			const cp3x = (x0 + 4 * x1 + x) / 6;
			const cp3y = (y0 + 4 * y1 + y) / 6;
			if (i === a.length - 1) {
				return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${cp3x},${cp3y} C${x},${y} ${x},${y} ${x},${y}`;
			}

			return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${cp3x},${cp3y}`;
		},
		''
	);
};
