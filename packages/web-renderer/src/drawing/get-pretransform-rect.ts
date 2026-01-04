// In some cases, we get a matrix that is too compressed:
// e.g. https://github.com/remotion-dev/remotion/issues/6185
// > You're rotating around the X-axis by ~89.96°, which means the Y-axis gets compressed to ⁠cos(89.96°) ≈ 0.000691 of its original size in the viewport.
const MAX_SCALE_FACTOR = 100;

export function getPreTransformRect(
	targetRect: DOMRect,
	matrix: DOMMatrix,
): DOMRect {
	// 1. Determine the effective 2D transformation by transforming basis vectors
	const origin = new DOMPoint(0, 0).matrixTransform(matrix);
	const unitX = new DOMPoint(1, 0).matrixTransform(matrix);
	const unitY = new DOMPoint(0, 1).matrixTransform(matrix);

	// 2. Compute the 2D basis vectors after transformation
	const basisX = {x: unitX.x - origin.x, y: unitX.y - origin.y};
	const basisY = {x: unitY.x - origin.x, y: unitY.y - origin.y};

	// Check effective scale in each axis
	const scaleX = Math.hypot(basisX.x, basisX.y);
	const scaleY = Math.hypot(basisY.x, basisY.y);

	// If either axis is too compressed, the inverse will explode
	const minScale = Math.min(scaleX, scaleY);
	if (minScale < 1 / MAX_SCALE_FACTOR) {
		// Content is nearly invisible, e.g. 89.96deg X rotation (edge-on view)
		return new DOMRect(0, 0, 0, 0);
	}

	// 3. Build the effective 2D matrix and invert it
	const effective2D = new DOMMatrix([
		basisX.x,
		basisX.y, // a, b (first column)
		basisY.x,
		basisY.y, // c, d (second column)
		origin.x,
		origin.y, // e, f (translation)
	]);

	const inverse2D = effective2D.inverse();

	const wasNotInvertible = isNaN(inverse2D.m11);

	// For example, a 90 degree rotation, is not being rendered
	if (wasNotInvertible) {
		return new DOMRect(0, 0, 0, 0);
	}

	// 4. Transform target rect corners using the 2D inverse
	const corners = [
		new DOMPoint(targetRect.x, targetRect.y),
		new DOMPoint(targetRect.x + targetRect.width, targetRect.y),
		new DOMPoint(
			targetRect.x + targetRect.width,
			targetRect.y + targetRect.height,
		),
		new DOMPoint(targetRect.x, targetRect.y + targetRect.height),
	];

	const transformedCorners = corners.map((c) => c.matrixTransform(inverse2D));

	// 5. Compute bounding box
	const xs = transformedCorners.map((p) => p.x);
	const ys = transformedCorners.map((p) => p.y);

	return new DOMRect(
		Math.min(...xs),
		Math.min(...ys),
		Math.max(...xs) - Math.min(...xs),
		Math.max(...ys) - Math.min(...ys),
	);
}
