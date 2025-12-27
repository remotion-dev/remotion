import {parseBorderRadius, setBorderRadius} from './border-radius';
import {drawBorder} from './draw-border';
import type {DrawFn} from './drawn-fn';
import {setOpacity} from './opacity';
import {setTransform} from './transform';

export const drawElement = async ({
	dimensions,
	computedStyle,
	context,
	draw,
	opacity,
	totalMatrix,
}: {
	dimensions: DOMRect;
	computedStyle: CSSStyleDeclaration;
	context: OffscreenCanvasRenderingContext2D;
	opacity: number;
	totalMatrix: DOMMatrix;
	draw: DrawFn;
}) => {
	const background = computedStyle.backgroundColor;
	const borderRadius = parseBorderRadius({
		borderRadius: computedStyle.borderRadius,
		width: dimensions.width,
		height: dimensions.height,
	});

	const finishTransform = setTransform({
		ctx: context,
		transform: totalMatrix,
	});

	const finishOverflowHiddenClip =
		computedStyle.overflow === 'hidden'
			? setBorderRadius({
					ctx: context,
					rect: dimensions,
					borderRadius,
					forceClipEvenWhenZero: true,
				})
			: () => {};

	const finishBorderRadius = setBorderRadius({
		ctx: context,
		rect: dimensions,
		borderRadius,
		forceClipEvenWhenZero: false,
	});
	const finishOpacity = setOpacity({
		ctx: context,
		opacity,
	});

	if (
		background &&
		background !== 'transparent' &&
		!(
			background.startsWith('rgba') &&
			(background.endsWith(', 0)') || background.endsWith(',0'))
		)
	) {
		const originalFillStyle = context.fillStyle;
		context.fillStyle = background;
		context.fillRect(
			dimensions.left,
			dimensions.top,
			dimensions.width,
			dimensions.height,
		);
		context.fillStyle = originalFillStyle;
	}

	await draw({dimensions, computedStyle, contextToDraw: context});

	drawBorder({
		ctx: context,
		x: dimensions.left,
		y: dimensions.top,
		width: dimensions.width,
		height: dimensions.height,
		borderRadius,
		computedStyle,
	});

	finishOpacity();
	finishBorderRadius();
	finishTransform();

	return {
		cleanupAfterChildren: () => {
			finishOverflowHiddenClip();
		},
	};
};
