export function transformDOMRect({
	rect,
	matrix,
}: {
	rect: DOMRect;
	matrix: DOMMatrix;
}): DOMRect {
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

	// Find the bounding box of the transformed points
	const minX = Math.min(
		transformedTopLeft.x / transformedTopLeft.w,
		transformedTopRight.x / transformedTopRight.w,
		transformedBottomLeft.x / transformedBottomLeft.w,
		transformedBottomRight.x / transformedBottomRight.w,
	);

	const maxX = Math.max(
		transformedTopLeft.x / transformedTopLeft.w,
		transformedTopRight.x / transformedTopRight.w,
		transformedBottomLeft.x / transformedBottomLeft.w,
		transformedBottomRight.x / transformedBottomRight.w,
	);

	const minY = Math.min(
		transformedTopLeft.y / transformedTopLeft.w,
		transformedTopRight.y / transformedTopRight.w,
		transformedBottomLeft.y / transformedBottomLeft.w,
		transformedBottomRight.y / transformedBottomRight.w,
	);

	const maxY = Math.max(
		transformedTopLeft.y / transformedTopLeft.w,
		transformedTopRight.y / transformedTopRight.w,
		transformedBottomLeft.y / transformedBottomLeft.w,
		transformedBottomRight.y / transformedBottomRight.w,
	);

	// Create a new DOMRect from the bounding box
	return new DOMRect(minX, minY, maxX - minX, maxY - minY);
}
