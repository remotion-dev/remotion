import type {LogLevel} from 'remotion';
import {parseBorderRadius, setBorderRadius} from './border-radius';
import {drawBackground} from './draw-background';
import {drawBorder} from './draw-border';
import {drawBorderRadius} from './draw-box-shadow';
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
	onlyBackgroundClip,
}: {
	rect: DOMRect;
	computedStyle: CSSStyleDeclaration;
	context: OffscreenCanvasRenderingContext2D;
	opacity: number;
	totalMatrix: DOMMatrix;
	draw: DrawFn;
	parentRect: DOMRect;
	logLevel: LogLevel;
	onlyBackgroundClip: boolean;
}) => {
	const {backgroundImage, backgroundColor} = computedStyle;
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
	drawBorderRadius({
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

	drawBackground({
		backgroundImage,
		context,
		rect,
		backgroundColor,
		backgroundClipText: onlyBackgroundClip,
	});

	if (!onlyBackgroundClip) {
		await draw({dimensions: rect, computedStyle, contextToDraw: context});

		drawBorder({
			ctx: context,
			rect,
			borderRadius,
			computedStyle,
		});
	}

	finishBorderRadius();

	// Drawing outline ignores overflow: hidden, finishing it and starting a new one for the outline
	drawOutline({
		ctx: context,
		rect,
		borderRadius,
		computedStyle,
		onlyBackgroundClip,
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
