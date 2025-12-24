import type {BorderRadiusCorners} from './border-radius';

interface BorderSideProperties {
	width: number;
	color: string;
	style: string;
}

const parseBorderWidth = (value: string): number => {
	return parseFloat(value) || 0;
};

const getBorderSideProperties = (
	computedStyle: CSSStyleDeclaration,
): {
	top: BorderSideProperties;
	right: BorderSideProperties;
	bottom: BorderSideProperties;
	left: BorderSideProperties;
} => {
	// Parse individual border properties for each side
	// This handles both shorthand (border: "1px solid red") and longhand (border-top-width: "1px") properties

	return {
		top: {
			width: parseBorderWidth(computedStyle.borderTopWidth),
			color: computedStyle.borderTopColor || computedStyle.borderColor || 'black',
			style: computedStyle.borderTopStyle || computedStyle.borderStyle || 'solid',
		},
		right: {
			width: parseBorderWidth(computedStyle.borderRightWidth),
			color: computedStyle.borderRightColor || computedStyle.borderColor || 'black',
			style: computedStyle.borderRightStyle || computedStyle.borderStyle || 'solid',
		},
		bottom: {
			width: parseBorderWidth(computedStyle.borderBottomWidth),
			color: computedStyle.borderBottomColor || computedStyle.borderColor || 'black',
			style: computedStyle.borderBottomStyle || computedStyle.borderStyle || 'solid',
		},
		left: {
			width: parseBorderWidth(computedStyle.borderLeftWidth),
			color: computedStyle.borderLeftColor || computedStyle.borderColor || 'black',
			style: computedStyle.borderLeftStyle || computedStyle.borderStyle || 'solid',
		},
	};
};

const getLineDashPattern = (style: string, width: number): number[] => {
	if (style === 'dashed') {
		return [width * 2, width];
	}
	if (style === 'dotted') {
		return [width, width];
	}
	return [];
};

const drawBorderSide = ({
	ctx,
	side,
	x,
	y,
	width,
	height,
	borderRadius,
	borderProperties,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	side: 'top' | 'right' | 'bottom' | 'left';
	x: number;
	y: number;
	width: number;
	height: number;
	borderRadius: BorderRadiusCorners;
	borderProperties: BorderSideProperties;
}) => {
	const {width: borderWidth, color, style} = borderProperties;

	if (borderWidth <= 0 || style === 'none' || style === 'hidden') {
		return;
	}

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = borderWidth;
	ctx.setLineDash(getLineDashPattern(style, borderWidth));

	const halfWidth = borderWidth / 2;

	if (side === 'top') {
		// Start point (accounting for left border and top-left radius)
		const startX = x + borderRadius.topLeft.horizontal;
		const startY = y + halfWidth;

		// End point (accounting for top-right radius)
		const endX = x + width - borderRadius.topRight.horizontal;
		const endY = y + halfWidth;

		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
	} else if (side === 'right') {
		// Start point (accounting for top border and top-right radius)
		const startX = x + width - halfWidth;
		const startY = y + borderRadius.topRight.vertical;

		// End point (accounting for bottom-right radius)
		const endX = x + width - halfWidth;
		const endY = y + height - borderRadius.bottomRight.vertical;

		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
	} else if (side === 'bottom') {
		// Start point (accounting for bottom-left radius)
		const startX = x + borderRadius.bottomLeft.horizontal;
		const startY = y + height - halfWidth;

		// End point (accounting for right border and bottom-right radius)
		const endX = x + width - borderRadius.bottomRight.horizontal;
		const endY = y + height - halfWidth;

		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
	} else if (side === 'left') {
		// Start point (accounting for top-left radius)
		const startX = x + halfWidth;
		const startY = y + borderRadius.topLeft.vertical;

		// End point (accounting for bottom border and bottom-left radius)
		const endX = x + halfWidth;
		const endY = y + height - borderRadius.bottomLeft.vertical;

		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
	}

	ctx.stroke();
};

const drawCorner = ({
	ctx,
	corner,
	x,
	y,
	width,
	height,
	borderRadius,
	topBorder,
	rightBorder,
	bottomBorder,
	leftBorder,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';
	x: number;
	y: number;
	width: number;
	height: number;
	borderRadius: BorderRadiusCorners;
	topBorder: BorderSideProperties;
	rightBorder: BorderSideProperties;
	bottomBorder: BorderSideProperties;
	leftBorder: BorderSideProperties;
}) => {
	const radius = borderRadius[corner];

	if (radius.horizontal <= 0 && radius.vertical <= 0) {
		return;
	}

	let border1: BorderSideProperties;
	let border2: BorderSideProperties;
	let centerX: number;
	let centerY: number;
	let startAngle: number;
	let endAngle: number;

	if (corner === 'topLeft') {
		border1 = leftBorder;
		border2 = topBorder;
		centerX = x + radius.horizontal;
		centerY = y + radius.vertical;
		startAngle = Math.PI;
		endAngle = (Math.PI * 3) / 2;
	} else if (corner === 'topRight') {
		border1 = topBorder;
		border2 = rightBorder;
		centerX = x + width - radius.horizontal;
		centerY = y + radius.vertical;
		startAngle = -Math.PI / 2;
		endAngle = 0;
	} else if (corner === 'bottomRight') {
		border1 = rightBorder;
		border2 = bottomBorder;
		centerX = x + width - radius.horizontal;
		centerY = y + height - radius.vertical;
		startAngle = 0;
		endAngle = Math.PI / 2;
	} else {
		// bottomLeft
		border1 = bottomBorder;
		border2 = leftBorder;
		centerX = x + radius.horizontal;
		centerY = y + height - radius.vertical;
		startAngle = Math.PI / 2;
		endAngle = Math.PI;
	}

	// Draw corner arc - use the average of the two adjacent borders
	// In a more sophisticated implementation, we could blend the two borders
	const avgWidth = (border1.width + border2.width) / 2;
	const useColor = border1.width >= border2.width ? border1.color : border2.color;
	const useStyle = border1.width >= border2.width ? border1.style : border2.style;

	if (avgWidth > 0 && useStyle !== 'none' && useStyle !== 'hidden') {
		ctx.beginPath();
		ctx.strokeStyle = useColor;
		ctx.lineWidth = avgWidth;
		ctx.setLineDash(getLineDashPattern(useStyle, avgWidth));

		// Adjust radius for the border width
		const adjustedRadiusH = Math.max(0, radius.horizontal - avgWidth / 2);
		const adjustedRadiusV = Math.max(0, radius.vertical - avgWidth / 2);

		ctx.ellipse(
			centerX,
			centerY,
			adjustedRadiusH,
			adjustedRadiusV,
			0,
			startAngle,
			endAngle,
		);

		ctx.stroke();
	}
};

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
	const borders = getBorderSideProperties(computedStyle);

	// Check if we have any visible border
	const hasBorder =
		borders.top.width > 0 ||
		borders.right.width > 0 ||
		borders.bottom.width > 0 ||
		borders.left.width > 0;

	if (!hasBorder) {
		return;
	}

	// Save original canvas state
	const originalStrokeStyle = ctx.strokeStyle;
	const originalLineWidth = ctx.lineWidth;
	const originalLineDash = ctx.getLineDash();

	// Draw corners first (they go underneath the straight edges)
	drawCorner({
		ctx,
		corner: 'topLeft',
		x,
		y,
		width,
		height,
		borderRadius,
		topBorder: borders.top,
		rightBorder: borders.right,
		bottomBorder: borders.bottom,
		leftBorder: borders.left,
	});

	drawCorner({
		ctx,
		corner: 'topRight',
		x,
		y,
		width,
		height,
		borderRadius,
		topBorder: borders.top,
		rightBorder: borders.right,
		bottomBorder: borders.bottom,
		leftBorder: borders.left,
	});

	drawCorner({
		ctx,
		corner: 'bottomRight',
		x,
		y,
		width,
		height,
		borderRadius,
		topBorder: borders.top,
		rightBorder: borders.right,
		bottomBorder: borders.bottom,
		leftBorder: borders.left,
	});

	drawCorner({
		ctx,
		corner: 'bottomLeft',
		x,
		y,
		width,
		height,
		borderRadius,
		topBorder: borders.top,
		rightBorder: borders.right,
		bottomBorder: borders.bottom,
		leftBorder: borders.left,
	});

	// Draw each border side
	drawBorderSide({
		ctx,
		side: 'top',
		x,
		y,
		width,
		height,
		borderRadius,
		borderProperties: borders.top,
	});

	drawBorderSide({
		ctx,
		side: 'right',
		x,
		y,
		width,
		height,
		borderRadius,
		borderProperties: borders.right,
	});

	drawBorderSide({
		ctx,
		side: 'bottom',
		x,
		y,
		width,
		height,
		borderRadius,
		borderProperties: borders.bottom,
	});

	drawBorderSide({
		ctx,
		side: 'left',
		x,
		y,
		width,
		height,
		borderRadius,
		borderProperties: borders.left,
	});

	// Restore original canvas state
	ctx.strokeStyle = originalStrokeStyle;
	ctx.lineWidth = originalLineWidth;
	ctx.setLineDash(originalLineDash);
};
