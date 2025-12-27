export function transformDOMRect({
	rect,
	matrix,
}: {
	rect: DOMRect;
	matrix: DOMMatrix;
}): DOMRect {
	// Get all four corners of the rectangle
	const topLeft = new DOMPoint(rect.left, rect.top);
	const topRight = new DOMPoint(rect.right, rect.top);
	const bottomLeft = new DOMPoint(rect.left, rect.bottom);
	const bottomRight = new DOMPoint(rect.right, rect.bottom);

	// Transform all corners
	const transformedTopLeft = topLeft.matrixTransform(matrix);
	const transformedTopRight = topRight.matrixTransform(matrix);
	const transformedBottomLeft = bottomLeft.matrixTransform(matrix);
	const transformedBottomRight = bottomRight.matrixTransform(matrix);

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

	// Create a new DOMRect from the bounding box
	return new DOMRect(minX, minY, maxX - minX, maxY - minY);
}
