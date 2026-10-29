import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {clampBorderRadius, setBorderRadius} from './border-radius';
import type {BorderRadiusCorners} from './border-radius';
import {getWiderRectAndExpand} from './clamp-rect-to-parent-bounds';
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
	logLevel,
	inset = false,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	computedStyle: CSSStyleDeclaration;
	logLevel: LogLevel;
	inset?: boolean;
}) => {
	const shadows = parseBoxShadow(computedStyle.boxShadow);
	if (shadows.length === 0) {
		return;
	}

	for (let i = shadows.length - 1; i >= 0; i--) {
		const shadow = shadows[i];
		if (shadow.inset !== inset) continue;
		if (shadow.inset) {
			// A blurred outer ring casts into the padding box even with zero spread.
			if (
				shadow.blurRadius === 0 &&
				shadow.spreadRadius <= 0 &&
				shadow.offsetX === 0 &&
				shadow.offsetY === 0
			)
				continue;
			const paddingRect = getPaddingBox(rect, computedStyle);
			if (paddingRect.width <= 0 || paddingRect.height <= 0) continue;
			const spread = shadow.spreadRadius;
			const innerWidth = paddingRect.width - 2 * spread;
			const innerHeight = paddingRect.height - 2 * spread;
			const left = paddingRect.left - rect.left;
			const right = rect.right - paddingRect.right;
			const top = paddingRect.top - rect.top;
			const bottom = rect.bottom - paddingRect.bottom;
			// CSS Backgrounds 3 applies spread after subtracting the border width.
			const insetRadius = (radius: number, borderWidth: number) => {
				const paddingRadius = Math.max(0, radius - borderWidth);
				const effectiveSpread =
					spread < 0 && paddingRadius < -spread
						? spread * (1 + (paddingRadius / -spread - 1) ** 3)
						: spread;
				return Math.max(0, paddingRadius - effectiveSpread);
			};

			const corners: [keyof BorderRadiusCorners, number, number][] = [
				['topLeft', left, top],
				['topRight', right, top],
				['bottomRight', right, bottom],
				['bottomLeft', left, bottom],
			];
			const innerRadius = Object.fromEntries(
				corners.map(([corner, horizontalInset, verticalInset]) => [
					corner,
					{
						horizontal: insetRadius(
							borderRadius[corner].horizontal,
							horizontalInset,
						),
						vertical: insetRadius(borderRadius[corner].vertical, verticalInset),
					},
				]),
			) as BorderRadiusCorners;
			const finishPaddingClip = setBorderRadius({
				ctx,
				rect,
				borderRadius,
				forceClipEvenWhenZero: true,
				computedStyle,
				backgroundClip: 'padding-box',
			});
			try {
				if (shadow.blurRadius > 0) {
					// Blur the exterior of the shifted hole in local CSS pixels, then
					// project the finished shadow with the rest of this element's plane.
					const margin = Math.ceil(
						shadow.blurRadius * 2 +
							Math.abs(shadow.offsetX) +
							Math.abs(shadow.offsetY) +
							Math.abs(spread) +
							2,
					);
					const width = Math.ceil(paddingRect.width + margin * 2);
					const height = Math.ceil(paddingRect.height + margin * 2);
					if (width > 16384 || height > 16384 || width * height > 16777216) {
						Internals.Log.warn(
							{logLevel, tag: '@remotion/web-renderer'},
							'Inset shadow exceeds the temporary bitmap budget',
						);
						continue;
					}

					const canvas = new OffscreenCanvas(width, height);
					try {
						const shadowCtx = canvas.getContext('2d');
						if (!shadowCtx)
							throw new Error('Failed to create inset shadow context');
						shadowCtx.fillStyle = shadow.color;
						shadowCtx.filter = `blur(${shadow.blurRadius / 2}px)`;
						shadowCtx.beginPath();
						shadowCtx.rect(0, 0, width, height);
						if (innerWidth > 0 && innerHeight > 0) {
							drawRoundedRectPath({
								ctx: shadowCtx,
								x: margin + spread + shadow.offsetX,
								y: margin + spread + shadow.offsetY,
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
							paddingRect.left - margin,
							paddingRect.top - margin,
						);
					} finally {
						canvas.width = 0;
						canvas.height = 0;
					}

					continue;
				}

				ctx.fillStyle = shadow.color;
				ctx.beginPath();
				ctx.rect(
					paddingRect.left,
					paddingRect.top,
					paddingRect.width,
					paddingRect.height,
				);
				if (innerWidth > 0 && innerHeight > 0) {
					drawRoundedRectPath({
						ctx,
						x: paddingRect.left + spread + shadow.offsetX,
						y: paddingRect.top + spread + shadow.offsetY,
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

				ctx.fill('evenodd');
			} finally {
				finishPaddingClip();
			}

			continue;
		}

		if (shadow.blurRadius === 0 && shadow.spreadRadius !== 0) {
			const spread = shadow.spreadRadius;
			const shadowRect = new DOMRect(
				rect.left - spread + shadow.offsetX,
				rect.top - spread + shadow.offsetY,
				rect.width + 2 * spread,
				rect.height + 2 * spread,
			);
			if (shadowRect.width <= 0 || shadowRect.height <= 0) continue;
			// CSS Backgrounds 3 keeps sharp corners when spread exceeds the radius.
			const outerRadius = (radius: number) => {
				const effectiveSpread =
					spread > 0 && radius < spread
						? spread * (1 + (radius / spread - 1) ** 3)
						: spread;
				return Math.max(0, radius + effectiveSpread);
			};

			const shadowRadius = clampBorderRadius({
				borderRadius: Object.fromEntries(
					Object.entries(borderRadius).map(([corner, radius]) => [
						corner,
						{
							horizontal: outerRadius(radius.horizontal),
							vertical: outerRadius(radius.vertical),
						},
					]),
				) as BorderRadiusCorners,
				width: shadowRect.width,
				height: shadowRect.height,
			});
			const unionRect = getWiderRectAndExpand({
				firstRect: rect,
				secondRect: shadowRect,
			});
			ctx.save();
			try {
				// Cut the original border shape out of the shifted shadow.
				ctx.beginPath();
				ctx.rect(
					unionRect.left,
					unionRect.top,
					unionRect.width,
					unionRect.height,
				);
				drawRoundedRectPath({
					ctx,
					x: rect.left,
					y: rect.top,
					width: rect.width,
					height: rect.height,
					borderRadius,
					appendToPath: true,
				});
				ctx.clip('evenodd');
				ctx.fillStyle = shadow.color;
				drawRoundedRectPath({
					ctx,
					x: shadowRect.left,
					y: shadowRect.top,
					width: shadowRect.width,
					height: shadowRect.height,
					borderRadius: shadowRadius,
				});
				ctx.fill();
			} finally {
				ctx.restore();
			}

			continue;
		}

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
