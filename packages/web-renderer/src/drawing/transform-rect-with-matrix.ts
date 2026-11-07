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

export const getProjectedCaptureScale = ({
	scale,
	sourceWidth,
	sourceHeight,
	projectedWidth,
	projectedHeight,
}: {
	scale: number;
	sourceWidth: number;
	sourceHeight: number;
	projectedWidth: number;
	projectedHeight: number;
}) => {
	if (
		![scale, sourceWidth, sourceHeight, projectedWidth, projectedHeight].every(
			Number.isFinite,
		) ||
		scale <= 0 ||
		sourceWidth <= 0 ||
		sourceHeight <= 0
	)
		return scale;
	const wanted =
		scale *
		Math.max(1, projectedWidth / sourceWidth, projectedHeight / sourceHeight);
	const fits = (value: number) => {
		const width = Math.ceil(sourceWidth * value);
		const height = Math.ceil(sourceHeight * value);
		return width <= 8192 && height <= 8192 && width * height <= 16777216;
	};

	// This helper only adds sampling density. Do not downsample an existing
	// caller allocation, including a high-resolution outer capture.
	if (wanted <= scale || !fits(scale)) return scale;
	if (fits(wanted)) return wanted;
	let low = scale;
	let high = wanted;
	for (let i = 0; i < 48; i++) {
		const middle = (low + high) / 2;
		if (fits(middle)) low = middle;
		else high = middle;
	}

	return low;
};
