import {parseBorderRadius, setBorderRadius} from './border-radius';
import {calculateTransforms} from './calculate-transforms';
import {drawBorder} from './draw-border';
import {setOpacity} from './opacity';
import {setTransform} from './transform';

export const drawElementToCanvas = async ({
	element,
	context,
	draw,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: (dimensions: DOMRect) => Promise<void>;
}) => {
	const {totalMatrix, reset, dimensions, opacity} =
		calculateTransforms(element);

	if (opacity === 0) {
		reset();
		return;
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		reset();
		return;
	}

	const computedStyle = getComputedStyle(element);
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

	await draw(dimensions);

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

	reset();
};
