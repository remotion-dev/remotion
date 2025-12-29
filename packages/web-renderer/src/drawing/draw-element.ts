import type {LogLevel} from 'remotion';
import {parseBorderRadius, setBorderRadius} from './border-radius';
import {drawBorder} from './draw-border';
import {setBoxShadow} from './draw-box-shadow';
import {drawOutline} from './draw-outline';
import type {DrawFn} from './drawn-fn';
import {setOpacity} from './opacity';
import {setOverflowHidden} from './overflow';
import {setTransform} from './transform';

export const drawElement = async ({
	rect,
	computedStyle,
	context,
	draw,
	opacity,
	totalMatrix,
	parentRect,
	logLevel,
}: {
	rect: DOMRect;
	computedStyle: CSSStyleDeclaration;
	context: OffscreenCanvasRenderingContext2D;
	opacity: number;
	totalMatrix: DOMMatrix;
	draw: DrawFn;
	parentRect: DOMRect;
	logLevel: LogLevel;
}) => {
	const background = computedStyle.backgroundColor;
	const borderRadius = parseBorderRadius({
		borderRadius: computedStyle.borderRadius,
		width: rect.width,
		height: rect.height,
	});

	const finishTransform = setTransform({
		ctx: context,
		transform: totalMatrix,
		parentRect,
	});

	const finishOpacity = setOpacity({
		ctx: context,
		opacity,
	});

	// Draw box shadow before border radius clip and background
	setBoxShadow({
		ctx: context,
		computedStyle,
		rect,
		borderRadius,
		logLevel,
	});
	const finishBorderRadius = setBorderRadius({
		ctx: context,
		rect,
		borderRadius,
		forceClipEvenWhenZero: false,
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
		context.fillRect(rect.left, rect.top, rect.width, rect.height);
		context.fillStyle = originalFillStyle;
	}

	await draw({dimensions: rect, computedStyle, contextToDraw: context});

	drawBorder({
		ctx: context,
		rect,
		borderRadius,
		computedStyle,
	});

	finishBorderRadius();

	// Drawing outline ignores overflow: hidden, finishing it and starting a new one for the outline
	drawOutline({
		ctx: context,
		rect,
		borderRadius,
		computedStyle,
	});

	const finishOverflowHidden = setOverflowHidden({
		ctx: context,
		rect,
		borderRadius,
		overflowHidden: computedStyle.overflow === 'hidden',
	});

	finishTransform();

	return {
		cleanupAfterChildren: () => {
			finishOpacity();
			finishOverflowHidden();
		},
	};
};
