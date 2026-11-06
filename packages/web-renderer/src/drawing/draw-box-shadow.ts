import {
	clampBorderRadius,
	setBorderRadius,
	type BorderRadiusCorners,
} from './border-radius';
import {drawRoundedRectPath} from './draw-rounded';
import {getPaddingBox} from './get-padding-box';
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
	inset,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	computedStyle: CSSStyleDeclaration;
	inset: boolean;
}) => {
	const shadows = parseBoxShadow(computedStyle.boxShadow);

	if (shadows.length === 0) {
		return;
	}

	// Draw shadows from last to first (so first shadow appears on top)
	for (let i = shadows.length - 1; i >= 0; i--) {
		const shadow = shadows[i];

		if (shadow.inset !== inset) {
			continue;
		}

		const spread = shadow.spreadRadius;
		if (shadow.inset) {
			const paddingRect = getPaddingBox(rect, computedStyle);
			if (paddingRect.width <= 0 || paddingRect.height <= 0) continue;
			const innerWidth = paddingRect.width - 2 * spread;
			const innerHeight = paddingRect.height - 2 * spread;
			const radiusForInset = (radius: number, borderWidth: number) => {
				const paddingRadius = Math.max(0, radius - borderWidth);
				const effectiveSpread =
					spread < 0 && paddingRadius < -spread
						? spread * (1 + (paddingRadius / -spread - 1) ** 3)
						: spread;
				return Math.max(0, paddingRadius - effectiveSpread);
			};

			const innerRadius = Object.fromEntries(
				(
					[
						[
							'topLeft',
							paddingRect.left - rect.left,
							paddingRect.top - rect.top,
						],
						[
							'topRight',
							rect.right - paddingRect.right,
							paddingRect.top - rect.top,
						],
						[
							'bottomRight',
							rect.right - paddingRect.right,
							rect.bottom - paddingRect.bottom,
						],
						[
							'bottomLeft',
							paddingRect.left - rect.left,
							rect.bottom - paddingRect.bottom,
						],
					] as const
				).map(([corner, x, y]) => [
					corner,
					{
						horizontal: radiusForInset(borderRadius[corner].horizontal, x),
						vertical: radiusForInset(borderRadius[corner].vertical, y),
					},
				]),
			) as BorderRadiusCorners;
			const finishClip = setBorderRadius({
				ctx,
				rect,
				borderRadius,
				computedStyle,
				backgroundClip: 'padding-box',
				forceClipEvenWhenZero: true,
			});
			const insetMargin = Math.ceil(
				shadow.blurRadius * 2 +
					Math.abs(shadow.offsetX) +
					Math.abs(shadow.offsetY) +
					Math.abs(spread) +
					2,
			);
			const canvas = new OffscreenCanvas(
				Math.ceil(paddingRect.width + insetMargin * 2),
				Math.ceil(paddingRect.height + insetMargin * 2),
			);
			try {
				const shadowCtx = canvas.getContext('2d');
				if (!shadowCtx) throw new Error('Failed to get shadow context');
				shadowCtx.fillStyle = shadow.color;
				shadowCtx.filter = `blur(${shadow.blurRadius / 2}px)`;
				shadowCtx.beginPath();
				shadowCtx.rect(0, 0, canvas.width, canvas.height);
				if (innerWidth > 0 && innerHeight > 0) {
					drawRoundedRectPath({
						ctx: shadowCtx,
						x: insetMargin + spread + shadow.offsetX,
						y: insetMargin + spread + shadow.offsetY,
						width: innerWidth,
						height: innerHeight,
						borderRadius: clampBorderRadius({
							borderRadius: innerRadius,
							width: innerWidth,
							height: innerHeight,
						}),
						appendToPath: true,
					});
				}

				shadowCtx.fill('evenodd');
				ctx.drawImage(
					canvas,
					paddingRect.left - insetMargin,
					paddingRect.top - insetMargin,
				);
			} finally {
				canvas.width = 0;
				canvas.height = 0;
				finishClip();
			}

			continue;
		}

		const width = rect.width + spread * 2;
		const height = rect.height + spread * 2;
		if (width <= 0 || height <= 0) continue;
		const shadowRadius = clampBorderRadius({
			borderRadius: Object.fromEntries(
				Object.entries(borderRadius).map(([corner, radius]) => {
					const outerRadius = (value: number) =>
						Math.max(
							0,
							value +
								(spread > 0 && value < spread
									? spread * (1 + (value / spread - 1) ** 3)
									: spread),
						);
					return [
						corner,
						{
							horizontal: outerRadius(radius.horizontal),
							vertical: outerRadius(radius.vertical),
						},
					];
				}),
			) as BorderRadiusCorners,
			width,
			height,
		});
		const margin = Math.ceil(shadow.blurRadius * 2);
		const newLeft = Math.floor(
			Math.min(rect.left, rect.left - spread + shadow.offsetX - margin),
		);
		const newTop = Math.floor(
			Math.min(rect.top, rect.top - spread + shadow.offsetY - margin),
		);
		const newRight = Math.ceil(
			Math.max(rect.right, rect.right + spread + shadow.offsetX + margin),
		);
		const newBottom = Math.ceil(
			Math.max(rect.bottom, rect.bottom + spread + shadow.offsetY + margin),
		);
		const leftOffset = rect.left - newLeft;
		const topOffset = rect.top - newTop;
		const newCanvas = new OffscreenCanvas(
			newRight - newLeft,
			newBottom - newTop,
		);
		const newCtx = newCanvas.getContext('2d');
		if (!newCtx) throw new Error('Failed to get context');

		// Apply shadow properties to canvas
		newCtx.shadowBlur = shadow.blurRadius;
		newCtx.shadowColor = shadow.color;
		newCtx.shadowOffsetX = shadow.offsetX + newCanvas.width * 2;
		newCtx.shadowOffsetY = shadow.offsetY;

		newCtx.fillStyle = 'black';
		drawRoundedRectPath({
			ctx: newCtx,
			x: leftOffset - spread - newCanvas.width * 2,
			y: topOffset - spread,
			width,
			height,
			borderRadius: shadowRadius,
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
