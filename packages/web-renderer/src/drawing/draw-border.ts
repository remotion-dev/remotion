import type {BorderRadiusCorners} from './border-radius';

export const drawBorder = ({
	ctx,
	x,
	y,
	width,
	height,
	borderRadius,
	computedStyle,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	x: number;
	y: number;
	width: number;
	height: number;
	borderRadius: BorderRadiusCorners;
	computedStyle: CSSStyleDeclaration;
}) => {
	const {
		borderStyle,
		borderColor,
		borderWidth: computedBorderWidth,
	} = computedStyle;

	// Parse border width (can be shorthand like "1px 2px 3px 4px")
	const borderWidths = computedBorderWidth
		.split(/\s+/)
		.map((w) => parseFloat(w));
	const borderTop = borderWidths[0] || 0;
	const borderRight = borderWidths[1] || borderTop;
	const borderBottom = borderWidths[2] || borderTop;
	const borderLeft = borderWidths[3] || borderRight;

	// Check if we have a visible border
	const hasBorder =
		borderStyle &&
		borderStyle !== 'none' &&
		borderStyle !== 'hidden' &&
		(borderTop > 0 || borderRight > 0 || borderBottom > 0 || borderLeft > 0);

	if (!hasBorder) {
		return;
	}

	const originalStrokeStyle = ctx.strokeStyle;
	const originalLineWidth = ctx.lineWidth;
	const originalLineDash = ctx.getLineDash();

	ctx.strokeStyle = borderColor;

	// Set line dash based on border style
	if (borderStyle === 'dashed') {
		const max = Math.max(borderTop, borderRight, borderBottom, borderLeft);
		ctx.setLineDash([max * 2, max]);
	} else if (borderStyle === 'dotted') {
		ctx.setLineDash([
			Math.max(borderTop, borderRight, borderBottom, borderLeft),
		]);
	} else {
		ctx.setLineDash([]);
	}

	// For simplicity, use the maximum border width if they differ
	// A full implementation would draw each side separately
	const maxBorderWidth = Math.max(
		borderTop,
		borderRight,
		borderBottom,
		borderLeft,
	);

	// Create path for border (inset by half the border width to draw inside)
	ctx.beginPath();

	const borderX = x + maxBorderWidth / 2;
	const borderY = y + maxBorderWidth / 2;
	const borderWidth = width - maxBorderWidth;
	const borderHeight = height - maxBorderWidth;

	// Account for border radius, adjusted for the border width
	const adjustedBorderRadius = {
		topLeft: {
			horizontal: Math.max(
				0,
				borderRadius.topLeft.horizontal - maxBorderWidth / 2,
			),
			vertical: Math.max(0, borderRadius.topLeft.vertical - maxBorderWidth / 2),
		},
		topRight: {
			horizontal: Math.max(
				0,
				borderRadius.topRight.horizontal - maxBorderWidth / 2,
			),
			vertical: Math.max(
				0,
				borderRadius.topRight.vertical - maxBorderWidth / 2,
			),
		},
		bottomRight: {
			horizontal: Math.max(
				0,
				borderRadius.bottomRight.horizontal - maxBorderWidth / 2,
			),
			vertical: Math.max(
				0,
				borderRadius.bottomRight.vertical - maxBorderWidth / 2,
			),
		},
		bottomLeft: {
			horizontal: Math.max(
				0,
				borderRadius.bottomLeft.horizontal - maxBorderWidth / 2,
			),
			vertical: Math.max(
				0,
				borderRadius.bottomLeft.vertical - maxBorderWidth / 2,
			),
		},
	};

	// Draw path with border radius
	ctx.moveTo(borderX + adjustedBorderRadius.topLeft.horizontal, borderY);

	// Top edge
	ctx.lineTo(
		borderX + borderWidth - adjustedBorderRadius.topRight.horizontal,
		borderY,
	);

	// Top-right corner
	if (
		adjustedBorderRadius.topRight.horizontal > 0 ||
		adjustedBorderRadius.topRight.vertical > 0
	) {
		ctx.ellipse(
			borderX + borderWidth - adjustedBorderRadius.topRight.horizontal,
			borderY + adjustedBorderRadius.topRight.vertical,
			adjustedBorderRadius.topRight.horizontal,
			adjustedBorderRadius.topRight.vertical,
			0,
			-Math.PI / 2,
			0,
		);
	}

	// Right edge
	ctx.lineTo(
		borderX + borderWidth,
		borderY + borderHeight - adjustedBorderRadius.bottomRight.vertical,
	);

	// Bottom-right corner
	if (
		adjustedBorderRadius.bottomRight.horizontal > 0 ||
		adjustedBorderRadius.bottomRight.vertical > 0
	) {
		ctx.ellipse(
			borderX + borderWidth - adjustedBorderRadius.bottomRight.horizontal,
			borderY + borderHeight - adjustedBorderRadius.bottomRight.vertical,
			adjustedBorderRadius.bottomRight.horizontal,
			adjustedBorderRadius.bottomRight.vertical,
			0,
			0,
			Math.PI / 2,
		);
	}

	// Bottom edge
	ctx.lineTo(
		borderX + adjustedBorderRadius.bottomLeft.horizontal,
		borderY + borderHeight,
	);

	// Bottom-left corner
	if (
		adjustedBorderRadius.bottomLeft.horizontal > 0 ||
		adjustedBorderRadius.bottomLeft.vertical > 0
	) {
		ctx.ellipse(
			borderX + adjustedBorderRadius.bottomLeft.horizontal,
			borderY + borderHeight - adjustedBorderRadius.bottomLeft.vertical,
			adjustedBorderRadius.bottomLeft.horizontal,
			adjustedBorderRadius.bottomLeft.vertical,
			0,
			Math.PI / 2,
			Math.PI,
		);
	}

	// Left edge
	ctx.lineTo(borderX, borderY + adjustedBorderRadius.topLeft.vertical);

	// Top-left corner
	if (
		adjustedBorderRadius.topLeft.horizontal > 0 ||
		adjustedBorderRadius.topLeft.vertical > 0
	) {
		ctx.ellipse(
			borderX + adjustedBorderRadius.topLeft.horizontal,
			borderY + adjustedBorderRadius.topLeft.vertical,
			adjustedBorderRadius.topLeft.horizontal,
			adjustedBorderRadius.topLeft.vertical,
			0,
			Math.PI,
			(Math.PI * 3) / 2,
		);
	}

	ctx.closePath();
	ctx.lineWidth = maxBorderWidth;
	ctx.stroke();

	// Restore original values
	ctx.strokeStyle = originalStrokeStyle;
	ctx.lineWidth = originalLineWidth;
	ctx.setLineDash(originalLineDash);
};
