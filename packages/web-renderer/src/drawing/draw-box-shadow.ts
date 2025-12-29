import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {BorderRadiusCorners} from './border-radius';
import {drawRoundedRectPath} from './draw-rounded';

interface BoxShadow {
	offsetX: number;
	offsetY: number;
	blurRadius: number;
	color: string;
	inset: boolean;
}

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

export const setBoxShadow = ({
	ctx,
	rect,
	borderRadius,
	computedStyle,
	logLevel,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	computedStyle: CSSStyleDeclaration;
	logLevel: LogLevel;
}) => {
	const shadows = parseBoxShadow(computedStyle.boxShadow);

	if (shadows.length === 0) {
		return;
	}

	// Draw shadows from last to first (so first shadow appears on top)
	for (let i = shadows.length - 1; i >= 0; i--) {
		const shadow = shadows[i];

		const newLeft = rect.left + Math.min(shadow.offsetX, 0) - shadow.blurRadius;
		const newRight =
			rect.right + Math.max(shadow.offsetX, 0) + shadow.blurRadius;
		const newTop = rect.top + Math.min(shadow.offsetY, 0) - shadow.blurRadius;
		const newBottom =
			rect.bottom + Math.max(shadow.offsetY, 0) + shadow.blurRadius;
		const newRect = new DOMRect(
			newLeft,
			newTop,
			newRight - newLeft,
			newBottom - newTop,
		);

		const leftOffset = rect.left - newLeft;
		const topOffset = rect.top - newTop;

		const newCanvas = new OffscreenCanvas(newRect.width, newRect.height);
		const newCtx = newCanvas.getContext('2d');
		if (!newCtx) {
			throw new Error('Failed to get context');
		}

		if (shadow.inset) {
			// TODO: Only warn once per render.
			Internals.Log.warn(
				{
					logLevel,
					tag: '@remotion/web-renderer',
				},
				'Detected "box-shadow" with "inset". This is not yet supported in @remotion/web-renderer',
			);
			continue;
		}

		// Apply shadow properties to canvas
		newCtx.shadowBlur = shadow.blurRadius;
		newCtx.shadowColor = shadow.color;
		newCtx.shadowOffsetX = shadow.offsetX;
		newCtx.shadowOffsetY = shadow.offsetY;

		newCtx.fillStyle = 'black';
		drawRoundedRectPath({
			ctx: newCtx,
			x: leftOffset,
			y: topOffset,
			width: rect.width,
			height: rect.height,
			borderRadius,
		});
		newCtx.fill();

		// Cut out the shape, leaving only shadow
		newCtx.shadowColor = 'transparent';
		newCtx.globalCompositeOperation = 'destination-out';

		drawRoundedRectPath({
			ctx: newCtx,
			x: leftOffset,
			y: topOffset,
			width: rect.width,
			height: rect.height,
			borderRadius,
		});
		newCtx.fill();

		ctx.drawImage(newCanvas, rect.left - leftOffset, rect.top - topOffset);
	}
};
