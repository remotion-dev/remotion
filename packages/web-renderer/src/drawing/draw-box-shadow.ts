import type {BorderRadiusCorners} from './border-radius';

interface BoxShadow {
	offsetX: number;
	offsetY: number;
	blurRadius: number;
	spreadRadius: number;
	color: string;
	inset: boolean;
}

/**
 * Parse a box-shadow CSS property value into an array of BoxShadow objects.
 * Handles multiple shadows separated by commas.
 */
export const parseBoxShadow = (boxShadowValue: string): BoxShadow[] => {
	if (!boxShadowValue || boxShadowValue === 'none') {
		return [];
	}

	const shadows: BoxShadow[] = [];

	// Split by comma, but respect rgba() colors
	const shadowStrings = boxShadowValue.split(/,(?![^(]*\))/);

	for (const shadowStr of shadowStrings) {
		const trimmed = shadowStr.trim();
		if (!trimmed || trimmed === 'none') {
			continue;
		}

		const shadow: BoxShadow = {
			offsetX: 0,
			offsetY: 0,
			blurRadius: 0,
			spreadRadius: 0,
			color: 'rgba(0, 0, 0, 0.5)',
			inset: false,
		};

		// Check for inset
		shadow.inset = /\binset\b/i.test(trimmed);

		// Remove 'inset' keyword
		let remaining = trimmed.replace(/\binset\b/gi, '').trim();

		// Extract color (can be rgb(), rgba(), hsl(), hsla(), hex, or named color)
		const colorMatch = remaining.match(
			/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8}|[a-z]+)/i,
		);
		if (colorMatch) {
			shadow.color = colorMatch[0];
			remaining = remaining.replace(colorMatch[0], '').trim();
		}

		// Parse remaining numeric values (offset-x offset-y blur spread)
		const numbers = remaining.match(/[+-]?\d*\.?\d+(?:px|em|rem|%)?/gi) || [];
		const values = numbers.map((n) => parseFloat(n) || 0);

		if (values.length >= 2) {
			shadow.offsetX = values[0];
			shadow.offsetY = values[1];

			if (values.length >= 3) {
				shadow.blurRadius = Math.max(0, values[2]); // Blur cannot be negative
			}

			if (values.length >= 4) {
				shadow.spreadRadius = values[3]; // Spread can be negative
			}
		}

		shadows.push(shadow);
	}

	return shadows;
};

/**
 * Draws a path following the border radius of a rectangle
 */
const drawRoundedRectPath = (
	ctx: OffscreenCanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	borderRadius: BorderRadiusCorners,
) => {
	ctx.beginPath();

	// Start from top-left corner, after the radius
	ctx.moveTo(x + borderRadius.topLeft.horizontal, y);

	// Top edge
	ctx.lineTo(x + width - borderRadius.topRight.horizontal, y);

	// Top-right corner
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

	// Right edge
	ctx.lineTo(x + width, y + height - borderRadius.bottomRight.vertical);

	// Bottom-right corner
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

	// Bottom edge
	ctx.lineTo(x + borderRadius.bottomLeft.horizontal, y + height);

	// Bottom-left corner
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

	// Left edge
	ctx.lineTo(x, y + borderRadius.topLeft.vertical);

	// Top-left corner
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
};

/**
 * Adjusts border radius for spread radius
 */
const adjustBorderRadiusForSpread = (
	borderRadius: BorderRadiusCorners,
	spread: number,
): BorderRadiusCorners => {
	return {
		topLeft: {
			horizontal:
				borderRadius.topLeft.horizontal === 0
					? 0
					: Math.max(0, borderRadius.topLeft.horizontal + spread),
			vertical:
				borderRadius.topLeft.vertical === 0
					? 0
					: Math.max(0, borderRadius.topLeft.vertical + spread),
		},
		topRight: {
			horizontal:
				borderRadius.topRight.horizontal === 0
					? 0
					: Math.max(0, borderRadius.topRight.horizontal + spread),
			vertical:
				borderRadius.topRight.vertical === 0
					? 0
					: Math.max(0, borderRadius.topRight.vertical + spread),
		},
		bottomRight: {
			horizontal:
				borderRadius.bottomRight.horizontal === 0
					? 0
					: Math.max(0, borderRadius.bottomRight.horizontal + spread),
			vertical:
				borderRadius.bottomRight.vertical === 0
					? 0
					: Math.max(0, borderRadius.bottomRight.vertical + spread),
		},
		bottomLeft: {
			horizontal:
				borderRadius.bottomLeft.horizontal === 0
					? 0
					: Math.max(0, borderRadius.bottomLeft.horizontal + spread),
			vertical:
				borderRadius.bottomLeft.vertical === 0
					? 0
					: Math.max(0, borderRadius.bottomLeft.vertical + spread),
		},
	};
};

export const drawBoxShadow = ({
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
	const shadows = parseBoxShadow(computedStyle.boxShadow);

	if (shadows.length === 0) {
		return;
	}

	// Save original canvas state
	const originalShadowBlur = ctx.shadowBlur;
	const originalShadowColor = ctx.shadowColor;
	const originalShadowOffsetX = ctx.shadowOffsetX;
	const originalShadowOffsetY = ctx.shadowOffsetY;
	const originalFillStyle = ctx.fillStyle;

	// Draw shadows from last to first (so first shadow appears on top)
	for (let i = shadows.length - 1; i >= 0; i--) {
		const shadow = shadows[i];

		if (shadow.inset) {
			// TODO: Inset shadows need different handling
			continue;
		}

		// Apply shadow properties to canvas
		ctx.shadowBlur = shadow.blurRadius;
		ctx.shadowColor = shadow.color;
		ctx.shadowOffsetX = shadow.offsetX;
		ctx.shadowOffsetY = shadow.offsetY;

		// Calculate shadow rectangle with spread
		const shadowX = rect.left + shadow.spreadRadius;
		const shadowY = rect.top + shadow.spreadRadius;
		const shadowW = rect.width - shadow.spreadRadius * 2;
		const shadowH = rect.height - shadow.spreadRadius * 2;

		// Adjust border radius for spread
		const adjustedBorderRadius = adjustBorderRadiusForSpread(
			borderRadius,
			-shadow.spreadRadius,
		);

		// Fill the shape (this will cast the shadow)
		ctx.fillStyle = shadow.color;
		drawRoundedRectPath(
			ctx,
			shadowX,
			shadowY,
			shadowW,
			shadowH,
			adjustedBorderRadius,
		);
		ctx.fill();
	}

	// Restore original canvas state
	ctx.shadowBlur = originalShadowBlur;
	ctx.shadowColor = originalShadowColor;
	ctx.shadowOffsetX = originalShadowOffsetX;
	ctx.shadowOffsetY = originalShadowOffsetY;
	ctx.fillStyle = originalFillStyle;
};
