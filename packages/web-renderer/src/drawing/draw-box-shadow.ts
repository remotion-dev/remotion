import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {BorderRadiusCorners} from './border-radius';
import {drawRoundedRectPath} from './draw-rounded';
import type {ShadowBase} from './parse-shadow';
import {parseShadowValues} from './parse-shadow';

interface BoxShadow extends ShadowBase {
	inset: boolean;
}

export const parseBoxShadow = (boxShadowValue: string): BoxShadow[] => {
	if (!boxShadowValue || boxShadowValue === 'none') {
		return [];
	}

	const baseShadows = parseShadowValues(
		// Remove 'inset' before parsing shared values
		boxShadowValue,
	);

	// Split by comma to check for inset on each shadow
	const shadowStrings = boxShadowValue.split(/,(?![^(]*\))/);

	return baseShadows.map((base, i) => ({
		...base,
		inset: /\binset\b/i.test(shadowStrings[i] || ''),
	}));
};

export const drawBorderRadius = ({
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
