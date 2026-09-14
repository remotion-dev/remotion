export type OutlinePoint = readonly [x: number, y: number];

type EncodedPoint = readonly [x: number, y: number];

const pointKey = ([x, y]: EncodedPoint): string => `${x},${y}`;

const edgeKey = (a: string, b: string): string =>
	a < b ? `${a}|${b}` : `${b}|${a}`;

const squaredDistance = (a: OutlinePoint, b: OutlinePoint): number => {
	const dx = a[0] - b[0];
	const dy = a[1] - b[1];
	return dx * dx + dy * dy;
};

const squaredSegmentDistance = (
	point: OutlinePoint,
	start: OutlinePoint,
	end: OutlinePoint,
): number => {
	let x = start[0];
	let y = start[1];
	let dx = end[0] - x;
	let dy = end[1] - y;

	if (dx !== 0 || dy !== 0) {
		const progress =
			((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
		if (progress > 1) {
			x = end[0];
			y = end[1];
		} else if (progress > 0) {
			x += dx * progress;
			y += dy * progress;
		}
	}

	dx = point[0] - x;
	dy = point[1] - y;
	return dx * dx + dy * dy;
};

const simplifyOpenContour = (
	points: readonly OutlinePoint[],
	toleranceSquared: number,
): OutlinePoint[] => {
	if (points.length <= 2) {
		return [...points];
	}

	const keep = new Uint8Array(points.length);
	keep[0] = 1;
	keep[points.length - 1] = 1;
	const stack: Array<readonly [number, number]> = [[0, points.length - 1]];

	while (stack.length > 0) {
		const range = stack.pop();
		if (!range) {
			break;
		}

		const [startIndex, endIndex] = range;
		let furthestIndex = -1;
		let furthestDistance = toleranceSquared;
		for (let index = startIndex + 1; index < endIndex; index++) {
			const distance = squaredSegmentDistance(
				points[index],
				points[startIndex],
				points[endIndex],
			);
			if (distance > furthestDistance) {
				furthestDistance = distance;
				furthestIndex = index;
			}
		}

		if (furthestIndex !== -1) {
			keep[furthestIndex] = 1;
			stack.push([startIndex, furthestIndex], [furthestIndex, endIndex]);
		}
	}

	return points.filter((_, index) => keep[index] === 1);
};

const simplifyClosedContour = (
	points: readonly OutlinePoint[],
	tolerance: number,
): OutlinePoint[] => {
	if (points.length <= 3 || tolerance <= 0) {
		return [...points];
	}

	let oppositeIndex = 1;
	let oppositeDistance = 0;
	for (let index = 1; index < points.length; index++) {
		const distance = squaredDistance(points[0], points[index]);
		if (distance > oppositeDistance) {
			oppositeDistance = distance;
			oppositeIndex = index;
		}
	}

	const firstHalf = points.slice(0, oppositeIndex + 1);
	const secondHalf = [...points.slice(oppositeIndex), points[0]];
	const toleranceSquared = tolerance * tolerance;
	const simplified = [
		...simplifyOpenContour(firstHalf, toleranceSquared).slice(0, -1),
		...simplifyOpenContour(secondHalf, toleranceSquared).slice(0, -1),
	];

	return simplified.length >= 3 ? simplified : [...points];
};

export const polygonizeAlpha = ({
	data,
	width,
	height,
	simplification,
}: {
	readonly data: Uint8ClampedArray;
	readonly width: number;
	readonly height: number;
	readonly simplification: number;
}): OutlinePoint[][] => {
	const adjacency = new Map<string, string[]>();
	const points = new Map<string, EncodedPoint>();

	const addSegment = (a: EncodedPoint, b: EncodedPoint) => {
		const aKey = pointKey(a);
		const bKey = pointKey(b);
		points.set(aKey, a);
		points.set(bKey, b);
		const aNeighbors = adjacency.get(aKey);
		if (aNeighbors) {
			aNeighbors.push(bKey);
		} else {
			adjacency.set(aKey, [bKey]);
		}

		const bNeighbors = adjacency.get(bKey);
		if (bNeighbors) {
			bNeighbors.push(aKey);
		} else {
			adjacency.set(bKey, [aKey]);
		}
	};

	const isFilled = (x: number, y: number) =>
		x >= 0 &&
		y >= 0 &&
		x < width &&
		y < height &&
		data[(y * width + x) * 4 + 3] > 0;

	for (let y = -1; y < height; y++) {
		for (let x = -1; x < width; x++) {
			const configuration =
				(isFilled(x, y) ? 1 : 0) |
				(isFilled(x + 1, y) ? 2 : 0) |
				(isFilled(x + 1, y + 1) ? 4 : 0) |
				(isFilled(x, y + 1) ? 8 : 0);
			if (configuration === 0 || configuration === 15) {
				continue;
			}

			const top: EncodedPoint = [x * 2 + 2, y * 2 + 1];
			const right: EncodedPoint = [x * 2 + 3, y * 2 + 2];
			const bottom: EncodedPoint = [x * 2 + 2, y * 2 + 3];
			const left: EncodedPoint = [x * 2 + 1, y * 2 + 2];

			switch (configuration) {
				case 1:
				case 14:
					addSegment(top, left);
					break;
				case 2:
				case 13:
					addSegment(top, right);
					break;
				case 3:
				case 12:
					addSegment(left, right);
					break;
				case 4:
				case 11:
					addSegment(right, bottom);
					break;
				case 5:
					addSegment(top, left);
					addSegment(right, bottom);
					break;
				case 6:
				case 9:
					addSegment(top, bottom);
					break;
				case 7:
				case 8:
					addSegment(bottom, left);
					break;
				case 10:
					addSegment(top, right);
					addSegment(bottom, left);
					break;
				default:
					throw new Error(`Unexpected marching squares case: ${configuration}`);
			}
		}
	}

	const visitedEdges = new Set<string>();
	const contours: OutlinePoint[][] = [];
	for (const [start, neighbors] of adjacency) {
		for (const firstNeighbor of neighbors) {
			if (visitedEdges.has(edgeKey(start, firstNeighbor))) {
				continue;
			}

			const contour = [start];
			let previous = start;
			let current = firstNeighbor;
			visitedEdges.add(edgeKey(previous, current));

			while (current !== start) {
				contour.push(current);
				const candidates = adjacency.get(current) ?? [];
				const next = candidates.find(
					(candidate) =>
						candidate !== previous &&
						!visitedEdges.has(edgeKey(current, candidate)),
				);
				if (!next) {
					break;
				}

				previous = current;
				current = next;
				visitedEdges.add(edgeKey(previous, current));
			}

			if (current !== start || contour.length < 3) {
				continue;
			}

			const decoded = contour.map((key): OutlinePoint => {
				const point = points.get(key);
				if (!point) {
					throw new Error(`Missing outline point: ${key}`);
				}

				return [point[0] / 2, point[1] / 2];
			});
			contours.push(simplifyClosedContour(decoded, simplification));
		}
	}

	return contours;
};
