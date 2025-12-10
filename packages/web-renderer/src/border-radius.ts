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

	return {
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
	};
}

export function setBorderRadius({
	ctx,
	x,
	y,
	width,
	height,
	borderRadius,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	x: number;
	y: number;
	width: number;
	height: number;
	borderRadius: BorderRadiusCorners;
}) {
	if (
		borderRadius.topLeft.horizontal === 0 &&
		borderRadius.topLeft.vertical === 0 &&
		borderRadius.topRight.horizontal === 0 &&
		borderRadius.topRight.vertical === 0 &&
		borderRadius.bottomRight.horizontal === 0 &&
		borderRadius.bottomRight.vertical === 0 &&
		borderRadius.bottomLeft.horizontal === 0 &&
		borderRadius.bottomLeft.vertical === 0
	) {
		return () => {};
	}

	ctx.save();
	ctx.beginPath();

	// Start at top-left corner, after the horizontal radius
	ctx.moveTo(x + borderRadius.topLeft.horizontal, y);

	// Top edge to top-right corner
	ctx.lineTo(x + width - borderRadius.topRight.horizontal, y);

	// Top-right corner (elliptical arc)
	if (
		borderRadius.topRight.horizontal > 0 ||
		borderRadius.topRight.vertical > 0
	) {
		ctx.ellipse(
			x + width - borderRadius.topRight.horizontal,
			y + borderRadius.topRight.vertical,
			borderRadius.topRight.horizontal,
			borderRadius.topRight.vertical,
			0,
			-Math.PI / 2,
			0,
		);
	}

	// Right edge to bottom-right corner
	ctx.lineTo(x + width, y + height - borderRadius.bottomRight.vertical);

	// Bottom-right corner (elliptical arc)
	if (
		borderRadius.bottomRight.horizontal > 0 ||
		borderRadius.bottomRight.vertical > 0
	) {
		ctx.ellipse(
			x + width - borderRadius.bottomRight.horizontal,
			y + height - borderRadius.bottomRight.vertical,
			borderRadius.bottomRight.horizontal,
			borderRadius.bottomRight.vertical,
			0,
			0,
			Math.PI / 2,
		);
	}

	// Bottom edge to bottom-left corner
	ctx.lineTo(x + borderRadius.bottomLeft.horizontal, y + height);

	// Bottom-left corner (elliptical arc)
	if (
		borderRadius.bottomLeft.horizontal > 0 ||
		borderRadius.bottomLeft.vertical > 0
	) {
		ctx.ellipse(
			x + borderRadius.bottomLeft.horizontal,
			y + height - borderRadius.bottomLeft.vertical,
			borderRadius.bottomLeft.horizontal,
			borderRadius.bottomLeft.vertical,
			0,
			Math.PI / 2,
			Math.PI,
		);
	}

	// Left edge to top-left corner
	ctx.lineTo(x, y + borderRadius.topLeft.vertical);

	// Top-left corner (elliptical arc)
	if (
		borderRadius.topLeft.horizontal > 0 ||
		borderRadius.topLeft.vertical > 0
	) {
		ctx.ellipse(
			x + borderRadius.topLeft.horizontal,
			y + borderRadius.topLeft.vertical,
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
