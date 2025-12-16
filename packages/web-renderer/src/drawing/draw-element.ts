import {parseBorderRadius, setBorderRadius} from './border-radius';
import {drawBorder} from './draw-border';
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
	draw: (
		dimensions: DOMRect,
		computedStyle: CSSStyleDeclaration,
	) => Promise<void> | void;
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
	const finishBorderRadius = setBorderRadius({
		ctx: context,
		x: dimensions.left,
		y: dimensions.top,
		width: dimensions.width,
		height: dimensions.height,
		borderRadius,
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

	await draw(dimensions, computedStyle);

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
};
