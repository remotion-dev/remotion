import type {BorderRadiusCorners} from './border-radius';

export const parseOutlineWidth = (value: string): number => {
	return parseFloat(value) || 0;
};

export const parseOutlineOffset = (value: string): number => {
	return parseFloat(value) || 0;
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

export const drawOutline = ({
	ctx,
	rect,
	borderRadius,
	computedStyle,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	computedStyle: CSSStyleDeclaration;
}) => {
	const outlineWidth = parseOutlineWidth(computedStyle.outlineWidth);
	const {outlineStyle} = computedStyle;
	const outlineColor = computedStyle.outlineColor || 'black';
	const outlineOffset = parseOutlineOffset(computedStyle.outlineOffset);

	// Check if we have a visible outline
	if (
		outlineWidth <= 0 ||
		outlineStyle === 'none' ||
		outlineStyle === 'hidden'
	) {
		return;
	}

	// Save original canvas state
	const originalStrokeStyle = ctx.strokeStyle;
	const originalLineWidth = ctx.lineWidth;
	const originalLineDash = ctx.getLineDash();

	ctx.beginPath();
	ctx.strokeStyle = outlineColor;
	ctx.lineWidth = outlineWidth;
	ctx.setLineDash(getLineDashPattern(outlineStyle, outlineWidth));

	// Calculate outline position
	// Outline is drawn outside the border edge, offset by outlineOffset
	const halfWidth = outlineWidth / 2;
	const offset = outlineOffset + halfWidth;

	const outlineX = rect.left - offset;
	const outlineY = rect.top - offset;
	const outlineW = rect.width + offset * 2;
	const outlineH = rect.height + offset * 2;

	// Adjust border radius for the outline offset
	// When outline-offset is positive, we need to expand the radius
	// When outline-offset is negative, we need to shrink the radius
	const adjustedBorderRadius = {
		topLeft: {
			horizontal:
				borderRadius.topLeft.horizontal === 0
					? 0
					: Math.max(0, borderRadius.topLeft.horizontal + offset),
			vertical:
				borderRadius.topLeft.vertical === 0
					? 0
					: Math.max(0, borderRadius.topLeft.vertical + offset),
		},
		topRight: {
			horizontal:
				borderRadius.topRight.horizontal === 0
					? 0
					: Math.max(0, borderRadius.topRight.horizontal + offset),
			vertical:
				borderRadius.topRight.vertical === 0
					? 0
					: Math.max(0, borderRadius.topRight.vertical + offset),
		},
		bottomRight: {
			horizontal:
				borderRadius.bottomRight.horizontal === 0
					? 0
					: Math.max(0, borderRadius.bottomRight.horizontal + offset),
			vertical:
				borderRadius.bottomRight.vertical === 0
					? 0
					: Math.max(0, borderRadius.bottomRight.vertical + offset),
		},
		bottomLeft: {
			horizontal:
				borderRadius.bottomLeft.horizontal === 0
					? 0
					: Math.max(0, borderRadius.bottomLeft.horizontal + offset),
			vertical:
				borderRadius.bottomLeft.vertical === 0
					? 0
					: Math.max(0, borderRadius.bottomLeft.vertical + offset),
		},
	};

	// Draw continuous path with border radius
	ctx.moveTo(outlineX + adjustedBorderRadius.topLeft.horizontal, outlineY);

	// Top edge
	ctx.lineTo(
		outlineX + outlineW - adjustedBorderRadius.topRight.horizontal,
		outlineY,
	);

	// Top-right corner
	if (
		adjustedBorderRadius.topRight.horizontal > 0 ||
		adjustedBorderRadius.topRight.vertical > 0
	) {
		ctx.ellipse(
			outlineX + outlineW - adjustedBorderRadius.topRight.horizontal,
			outlineY + adjustedBorderRadius.topRight.vertical,
			adjustedBorderRadius.topRight.horizontal,
			adjustedBorderRadius.topRight.vertical,
			0,
			-Math.PI / 2,
			0,
		);
	}

	// Right edge
	ctx.lineTo(
		outlineX + outlineW,
		outlineY + outlineH - adjustedBorderRadius.bottomRight.vertical,
	);

	// Bottom-right corner
	if (
		adjustedBorderRadius.bottomRight.horizontal > 0 ||
		adjustedBorderRadius.bottomRight.vertical > 0
	) {
		ctx.ellipse(
			outlineX + outlineW - adjustedBorderRadius.bottomRight.horizontal,
			outlineY + outlineH - adjustedBorderRadius.bottomRight.vertical,
			adjustedBorderRadius.bottomRight.horizontal,
			adjustedBorderRadius.bottomRight.vertical,
			0,
			0,
			Math.PI / 2,
		);
	}

	// Bottom edge
	ctx.lineTo(
		outlineX + adjustedBorderRadius.bottomLeft.horizontal,
		outlineY + outlineH,
	);

	// Bottom-left corner
	if (
		adjustedBorderRadius.bottomLeft.horizontal > 0 ||
		adjustedBorderRadius.bottomLeft.vertical > 0
	) {
		ctx.ellipse(
			outlineX + adjustedBorderRadius.bottomLeft.horizontal,
			outlineY + outlineH - adjustedBorderRadius.bottomLeft.vertical,
			adjustedBorderRadius.bottomLeft.horizontal,
			adjustedBorderRadius.bottomLeft.vertical,
			0,
			Math.PI / 2,
			Math.PI,
		);
	}

	// Left edge
	ctx.lineTo(outlineX, outlineY + adjustedBorderRadius.topLeft.vertical);

	// Top-left corner
	if (
		adjustedBorderRadius.topLeft.horizontal > 0 ||
		adjustedBorderRadius.topLeft.vertical > 0
	) {
		ctx.ellipse(
			outlineX + adjustedBorderRadius.topLeft.horizontal,
			outlineY + adjustedBorderRadius.topLeft.vertical,
			adjustedBorderRadius.topLeft.horizontal,
			adjustedBorderRadius.topLeft.vertical,
			0,
			Math.PI,
			(Math.PI * 3) / 2,
		);
	}

	ctx.closePath();
	ctx.stroke();

	// Restore original canvas state
	ctx.strokeStyle = originalStrokeStyle;
	ctx.lineWidth = originalLineWidth;
	ctx.setLineDash(originalLineDash);
};
