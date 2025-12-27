export type BorderRadiusCorners = {
	topLeft: {horizontal: number; vertical: number};
	topRight: {horizontal: number; vertical: number};
	bottomRight: {horizontal: number; vertical: number};
	bottomLeft: {horizontal: number; vertical: number};
};

function parseValue({
	value,
	reference,
}: {
	value: string;
	reference: number;
}): number {
	value = value.trim();
	if (value.endsWith('%')) {
		const percentage = parseFloat(value);
		return (percentage / 100) * reference;
	}

	if (value.endsWith('px')) {
		return parseFloat(value);
	}

	// If no unit, assume pixels
	return parseFloat(value);
}

function expandShorthand(values: string[]): [string, string, string, string] {
	if (values.length === 1) {
		// All corners the same
		return [values[0], values[0], values[0], values[0]];
	}

	if (values.length === 2) {
		// [0] = top-left & bottom-right, [1] = top-right & bottom-left
		return [values[0], values[1], values[0], values[1]];
	}

	if (values.length === 3) {
		// [0] = top-left, [1] = top-right & bottom-left, [2] = bottom-right
		return [values[0], values[1], values[2], values[1]];
	}

	// 4 values: top-left, top-right, bottom-right, bottom-left
	return [values[0], values[1], values[2], values[3]];
}

function clampBorderRadius({
	borderRadius,
	width,
	height,
}: {
	borderRadius: BorderRadiusCorners;
	width: number;
	height: number;
}): BorderRadiusCorners {
	// According to CSS spec, if the sum of border radii on adjacent corners
	// exceeds the length of the edge, they should be proportionally reduced
	const clamped = {
		topLeft: {...borderRadius.topLeft},
		topRight: {...borderRadius.topRight},
		bottomRight: {...borderRadius.bottomRight},
		bottomLeft: {...borderRadius.bottomLeft},
	};

	// Check top edge
	const topSum = clamped.topLeft.horizontal + clamped.topRight.horizontal;
	if (topSum > width) {
		const factor = width / topSum;
		clamped.topLeft.horizontal *= factor;
		clamped.topRight.horizontal *= factor;
	}

	// Check right edge
	const rightSum = clamped.topRight.vertical + clamped.bottomRight.vertical;
	if (rightSum > height) {
		const factor = height / rightSum;
		clamped.topRight.vertical *= factor;
		clamped.bottomRight.vertical *= factor;
	}

	// Check bottom edge
	const bottomSum =
		clamped.bottomRight.horizontal + clamped.bottomLeft.horizontal;
	if (bottomSum > width) {
		const factor = width / bottomSum;
		clamped.bottomRight.horizontal *= factor;
		clamped.bottomLeft.horizontal *= factor;
	}

	// Check left edge
	const leftSum = clamped.bottomLeft.vertical + clamped.topLeft.vertical;
	if (leftSum > height) {
		const factor = height / leftSum;
		clamped.bottomLeft.vertical *= factor;
		clamped.topLeft.vertical *= factor;
	}

	return clamped;
}

export function parseBorderRadius({
	borderRadius,
	width,
	height,
}: {
	borderRadius: string;
	width: number;
	height: number;
}): BorderRadiusCorners {
	// Split by '/' to separate horizontal and vertical radii
	const parts = borderRadius.split('/').map((part) => part.trim());

	const horizontalPart = parts[0];
	const verticalPart = parts[1];

	// Split each part into individual values
	const horizontalValues = horizontalPart.split(/\s+/).filter((v) => v);
	const verticalValues = verticalPart
		? verticalPart.split(/\s+/).filter((v) => v)
		: horizontalValues; // If no '/', use horizontal values for vertical

	// Expand shorthand to 4 values
	const [hTopLeft, hTopRight, hBottomRight, hBottomLeft] =
		expandShorthand(horizontalValues);
	const [vTopLeft, vTopRight, vBottomRight, vBottomLeft] =
		expandShorthand(verticalValues);

	return clampBorderRadius({
		borderRadius: {
			topLeft: {
				horizontal: parseValue({value: hTopLeft, reference: width}),
				vertical: parseValue({value: vTopLeft, reference: height}),
			},
			topRight: {
				horizontal: parseValue({value: hTopRight, reference: width}),
				vertical: parseValue({value: vTopRight, reference: height}),
			},
			bottomRight: {
				horizontal: parseValue({value: hBottomRight, reference: width}),
				vertical: parseValue({value: vBottomRight, reference: height}),
			},
			bottomLeft: {
				horizontal: parseValue({value: hBottomLeft, reference: width}),
				vertical: parseValue({value: vBottomLeft, reference: height}),
			},
		},
		width,
		height,
	});
}

export function setBorderRadius({
	ctx,
	rect,
	borderRadius,
	forceClipEvenWhenZero = false,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	forceClipEvenWhenZero: boolean;
}) {
	if (
		borderRadius.topLeft.horizontal === 0 &&
		borderRadius.topLeft.vertical === 0 &&
		borderRadius.topRight.horizontal === 0 &&
		borderRadius.topRight.vertical === 0 &&
		borderRadius.bottomRight.horizontal === 0 &&
		borderRadius.bottomRight.vertical === 0 &&
		borderRadius.bottomLeft.horizontal === 0 &&
		borderRadius.bottomLeft.vertical === 0 &&
		!forceClipEvenWhenZero
	) {
		return () => {};
	}

	ctx.save();
	ctx.beginPath();

	// Start at top-left corner, after the horizontal radius
	ctx.moveTo(rect.left + borderRadius.topLeft.horizontal, rect.top);

	// Top edge to top-right corner
	ctx.lineTo(
		rect.left + rect.width - borderRadius.topRight.horizontal,
		rect.top,
	);

	// Top-right corner (elliptical arc)
	if (
		borderRadius.topRight.horizontal > 0 ||
		borderRadius.topRight.vertical > 0
	) {
		ctx.ellipse(
			rect.left + rect.width - borderRadius.topRight.horizontal,
			rect.top + borderRadius.topRight.vertical,
			borderRadius.topRight.horizontal,
			borderRadius.topRight.vertical,
			0,
			-Math.PI / 2,
			0,
		);
	}

	// Right edge to bottom-right corner
	ctx.lineTo(
		rect.left + rect.width,
		rect.top + rect.height - borderRadius.bottomRight.vertical,
	);

	// Bottom-right corner (elliptical arc)
	if (
		borderRadius.bottomRight.horizontal > 0 ||
		borderRadius.bottomRight.vertical > 0
	) {
		ctx.ellipse(
			rect.left + rect.width - borderRadius.bottomRight.horizontal,
			rect.top + rect.height - borderRadius.bottomRight.vertical,
			borderRadius.bottomRight.horizontal,
			borderRadius.bottomRight.vertical,
			0,
			0,
			Math.PI / 2,
		);
	}

	// Bottom edge to bottom-left corner
	ctx.lineTo(
		rect.left + borderRadius.bottomLeft.horizontal,
		rect.top + rect.height,
	);

	// Bottom-left corner (elliptical arc)
	if (
		borderRadius.bottomLeft.horizontal > 0 ||
		borderRadius.bottomLeft.vertical > 0
	) {
		ctx.ellipse(
			rect.left + borderRadius.bottomLeft.horizontal,
			rect.top + rect.height - borderRadius.bottomLeft.vertical,
			borderRadius.bottomLeft.horizontal,
			borderRadius.bottomLeft.vertical,
			0,
			Math.PI / 2,
			Math.PI,
		);
	}

	// Left edge to top-left corner
	ctx.lineTo(rect.left, rect.top + borderRadius.topLeft.vertical);

	// Top-left corner (elliptical arc)
	if (
		borderRadius.topLeft.horizontal > 0 ||
		borderRadius.topLeft.vertical > 0
	) {
		ctx.ellipse(
			rect.left + borderRadius.topLeft.horizontal,
			rect.top + borderRadius.topLeft.vertical,
			borderRadius.topLeft.horizontal,
			borderRadius.topLeft.vertical,
			0,
			Math.PI,
			(Math.PI * 3) / 2,
		);
	}

	ctx.closePath();
	ctx.clip();

	return () => {
		ctx.restore();
	};
}
