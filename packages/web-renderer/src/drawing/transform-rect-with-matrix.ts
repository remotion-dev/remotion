export function transformDOMRect({
	rect,
	matrix,
}: {
	rect: DOMRect;
	matrix: DOMMatrix;
}): {rect: DOMRect; w1: number; w2: number; w3: number; w4: number} {
	// Get all four corners of the rectangle
	const topLeft = new DOMPointReadOnly(rect.left, rect.top);
	const topRight = new DOMPointReadOnly(rect.right, rect.top);
	const bottomLeft = new DOMPointReadOnly(rect.left, rect.bottom);
	const bottomRight = new DOMPointReadOnly(rect.right, rect.bottom);

	// Transform all corners
	const transformedTopLeft = topLeft.matrixTransform(matrix);
	const transformedTopRight = topRight.matrixTransform(matrix);
	const transformedBottomLeft = bottomLeft.matrixTransform(matrix);
	const transformedBottomRight = bottomRight.matrixTransform(matrix);

	const w1 = transformedTopLeft.w;
	const w2 = transformedTopRight.w;
	const w3 = transformedBottomLeft.w;
	const w4 = transformedBottomRight.w;

	// Find the bounding box of the transformed points
	const minX = Math.min(
		transformedTopLeft.x,
		transformedTopRight.x,
		transformedBottomLeft.x,
		transformedBottomRight.x,
	);

	const maxX = Math.max(
		transformedTopLeft.x,
		transformedTopRight.x,
		transformedBottomLeft.x,
		transformedBottomRight.x,
	);

	const minY = Math.min(
		transformedTopLeft.y,
		transformedTopRight.y,
		transformedBottomLeft.y,
		transformedBottomRight.y,
	);

	const maxY = Math.max(
		transformedTopLeft.y,
		transformedTopRight.y,
		transformedBottomLeft.y,
		transformedBottomRight.y,
	);

	console.log(transformedTopRight);

	// Create a new DOMRect from the bounding box
	return {
		rect: new DOMRect(minX, minY, maxX - minX, maxY - minY),
		w1,
		w2,
		w3,
		w4,
	};
}
