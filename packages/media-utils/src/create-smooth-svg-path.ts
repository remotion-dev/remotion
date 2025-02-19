const line = (pointA: Point, pointB: Point) => {
	const lengthX = pointB.x - pointA.x;
	const lengthY = pointB.y - pointA.y;
	return {
		length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
		angle: Math.atan2(lengthY, lengthX),
	};
};

const controlPoint = ({
	current,
	previous,
	next,
	reverse,
}: {
	current: Point;
	previous: Point;
	next: Point;
	reverse: boolean;
}): Point => {
	const p = previous || current;
	const n = next || current;
	// The smoothing ratio
	const smoothing = 0.2;
	// Properties of the opposed-line
	const o = line(p, n);

	const angle = o.angle + (reverse ? Math.PI : 0);
	const length = o.length * smoothing;

	const x = current.x + Math.cos(angle) * length;
	const y = current.y + Math.sin(angle) * length;

	return {x, y};
};

export type Point = {
	x: number;
	y: number;
};

export const createSmoothSvgPath = ({points}: {points: Point[]}) => {
	return points.reduce((acc: string, current: Point, i: number, a) => {
		if (i === 0) {
			return `M ${current.x},${current.y}`;
		}

		const {x, y} = current;

		const previous = a[i - 1];
		const twoPrevious = a[i - 2];
		const next = a[i + 1];

		const {x: cp1x, y: cp1y} = controlPoint({
			current: previous,
			previous: twoPrevious,
			next: current,
			reverse: false,
		});
		const {x: cp2x, y: cp2y} = controlPoint({
			current,
			previous,
			next,
			reverse: true,
		});

		return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
	}, '');
};
