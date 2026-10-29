// In some cases, we get a matrix that is too compressed:
// e.g. https://github.com/remotion-dev/remotion/issues/6185
// > You're rotating around the X-axis by ~89.96°, which means the Y-axis gets compressed to ⁠cos(89.96°) ≈ 0.000691 of its original size in the viewport.
const MAX_SCALE_FACTOR = 100;

export const isScaleTooBig = (matrix: DOMMatrix) => {
	const origin = new DOMPoint(0, 0).matrixTransform(matrix);
	const unitX = new DOMPoint(1, 0).matrixTransform(matrix);
	const unitY = new DOMPoint(0, 1).matrixTransform(matrix);

	// 2. Compute the 2D basis vectors after transformation
	const basisX = {x: unitX.x - origin.x, y: unitX.y - origin.y};
	const basisY = {x: unitY.x - origin.x, y: unitY.y - origin.y};

	// Check effective scale in each axis
	const scaleX = 1 / Math.hypot(basisX.x, basisX.y);
	const scaleY = 1 / Math.hypot(basisY.x, basisY.y);

	// If either axis is too compressed, the inverse will explode
	const maxScale = Math.max(scaleX, scaleY);
	if (maxScale > MAX_SCALE_FACTOR) {
		// Content is nearly invisible, e.g. 89.96deg X rotation (edge-on view)
		return true;
	}

	return false;
};

// Clip the finite source plane against output viewport half-planes before
// dividing by w. Inverting only the four viewport corners is unsafe when
// the inverse viewport crosses the projective horizon.
export const clipPolygonToHalfPlanes = <T extends Record<string, number>>(
	polygon: T[],
	distances: ((point: T) => number)[],
) => {
	for (const distance of distances) {
		const input = polygon;
		polygon = [];
		for (let i = 0; i < input.length; i++) {
			const a = input[i];
			const b = input[(i + 1) % input.length];
			const da = distance(a);
			const db = distance(b);
			if (da >= 0) polygon.push(a);
			if (da >= 0 !== db >= 0) {
				const t = da / (da - db);
				polygon.push(
					Object.fromEntries(
						Object.keys(a).map((key) => [key, a[key] + t * (b[key] - a[key])]),
					) as T,
				);
			}
		}

		if (!polygon.length) break;
	}

	return polygon;
};

export const clipSourceRectToViewport = (
	rect: DOMRect,
	matrix: DOMMatrix,
	viewport: DOMRect,
) => {
	let polygon = [
		{x: rect.left, y: rect.top},
		{x: rect.right, y: rect.top},
		{x: rect.right, y: rect.bottom},
		{x: rect.left, y: rect.bottom},
	];
	const x = (p: {x: number; y: number}) =>
		matrix.m11 * p.x + matrix.m21 * p.y + matrix.m41;
	const y = (p: {x: number; y: number}) =>
		matrix.m12 * p.x + matrix.m22 * p.y + matrix.m42;
	const w = (p: {x: number; y: number}) =>
		matrix.m14 * p.x + matrix.m24 * p.y + matrix.m44;
	const distances: ((p: {x: number; y: number}) => number)[] = [
		(p) => w(p) - 1e-7,
		(p) => x(p) - viewport.left * w(p),
		(p) => viewport.right * w(p) - x(p),
		(p) => y(p) - viewport.top * w(p),
		(p) => viewport.bottom * w(p) - y(p),
	];
	polygon = clipPolygonToHalfPlanes(polygon, distances);
	if (!polygon.length) return null;
	const left = Math.min(...polygon.map((p) => p.x));
	const top = Math.min(...polygon.map((p) => p.y));
	const right = Math.max(...polygon.map((p) => p.x));
	const bottom = Math.max(...polygon.map((p) => p.y));
	return new DOMRect(left, top, right - left, bottom - top);
};
