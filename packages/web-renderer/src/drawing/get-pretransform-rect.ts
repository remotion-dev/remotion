// In some cases, we get a matrix that is too compressed:
// e.g. https://github.com/remotion-dev/remotion/issues/6185
// > You're rotating around the X-axis by ~89.96°, which means the Y-axis gets compressed to ⁠cos(89.96°) ≈ 0.000691 of its original size in the viewport.
const MAX_SCALE_FACTOR = 100;

const isScaleTooBig = (matrix: DOMMatrix) => {
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

// Invert a single point through a projective transform
// Given screen point (xp, yp), find source point (x, y) at z=0
// such that transform(x, y, 0) projects to (xp, yp)
function invertProjectivePoint(
	xp: number,
	yp: number,
	matrix: DOMMatrix,
): {x: number; y: number} | null {
	// For z=0 points, the transform gives:
	// x' = m11*x + m21*y + m41
	// y' = m12*x + m22*y + m42
	// w' = m14*x + m24*y + m44
	// Projected: xp = x'/w', yp = y'/w'
	//
	// Solving for (x, y):
	// (m11 - xp*m14)*x + (m21 - xp*m24)*y = xp*m44 - m41
	// (m12 - yp*m14)*x + (m22 - yp*m24)*y = yp*m44 - m42

	const A = matrix.m11 - xp * matrix.m14;
	const B = matrix.m21 - xp * matrix.m24;
	const C = xp * matrix.m44 - matrix.m41;
	const D = matrix.m12 - yp * matrix.m14;
	const E = matrix.m22 - yp * matrix.m24;
	const F = yp * matrix.m44 - matrix.m42;

	const det = A * E - B * D;

	if (Math.abs(det) < 1e-10) {
		return null;
	}

	const x = (C * E - B * F) / det;
	const y = (A * F - C * D) / det;

	return {x, y};
}

export function getPreTransformRect(
	targetRect: DOMRect,
	matrix: DOMMatrix,
): DOMRect | null {
	if (isScaleTooBig(matrix)) {
		return null;
	}

	const corners = [
		{x: targetRect.x, y: targetRect.y},
		{x: targetRect.x + targetRect.width, y: targetRect.y},
		{x: targetRect.x + targetRect.width, y: targetRect.y + targetRect.height},
		{x: targetRect.x, y: targetRect.y + targetRect.height},
	];

	// For perspective transforms, invert each corner individually
	const invertedCorners: {x: number; y: number}[] = [];

	for (const corner of corners) {
		const inverted = invertProjectivePoint(corner.x, corner.y, matrix);
		if (inverted === null) {
			// Transform is degenerate at this point
			return new DOMRect(0, 0, 0, 0);
		}

		invertedCorners.push(inverted);
	}

	// Compute bounding box
	const xCoords = invertedCorners.map((p) => p.x);
	const yCoords = invertedCorners.map((p) => p.y);

	return new DOMRect(
		Math.min(...xCoords),
		Math.min(...yCoords),
		Math.max(...xCoords) - Math.min(...xCoords),
		Math.max(...yCoords) - Math.min(...yCoords),
	);
}
