import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
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
	element,
	internalState,
	scale,
}: {
	rect: DOMRect;
	computedStyle: CSSStyleDeclaration;
	context: OffscreenCanvasRenderingContext2D;
	opacity: number;
	totalMatrix: DOMMatrix;
	draw: DrawFn;
	parentRect: DOMRect;
	logLevel: LogLevel;
	element: HTMLElement | SVGElement;
	internalState: InternalState;
	scale: number;
}) => {
	const {backgroundImage, backgroundColor, backgroundClip} = computedStyle;
	const borderRadius = parseBorderRadius({
		borderRadius: computedStyle.borderRadius,
		width: rect.width,
		height: rect.height,
	});

	const finishTransform = setTransform({
		ctx: context,
		transform: totalMatrix,
		parentRect,
		scale,
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
		computedStyle,
		backgroundClip,
	});

	await drawBackground({
		backgroundImage,
		context,
		rect,
		backgroundColor,
		backgroundClip,
		element,
		logLevel,
		internalState,
		computedStyle,
		offsetLeft: parentRect.left,
		offsetTop: parentRect.top,
	});

	await draw({dimensions: rect, computedStyle, contextToDraw: context});

	finishBorderRadius();

	drawBorder({
		ctx: context,
		rect,
		borderRadius,
		computedStyle,
	});

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
		computedStyle,
		backgroundClip,
	});

	finishTransform();

	return {
		cleanupAfterChildren: () => {
			finishOpacity();
			finishOverflowHidden();
		},
	};
};
