import type {BorderRadiusCorners} from './border-radius';
import {drawRoundedRectPath} from './draw-rounded';

interface BoxShadow {
	offsetX: number;
	offsetY: number;
	blurRadius: number;
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
		}

		shadows.push(shadow);
	}

	return shadows;
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

		// Fill the shape (this will cast the shadow)
		ctx.fillStyle = 'red';
		drawRoundedRectPath({
			ctx,
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height,
			borderRadius,
		});
		ctx.fill();
	}

	// Restore original canvas state
	ctx.shadowBlur = originalShadowBlur;
	ctx.shadowColor = originalShadowColor;
	ctx.shadowOffsetX = originalShadowOffsetX;
	ctx.shadowOffsetY = originalShadowOffsetY;
	ctx.fillStyle = originalFillStyle;
};
