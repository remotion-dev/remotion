import {parseBorderRadius, setBorderRadius} from './border-radius';
import {calculateTransforms} from './calculate-transforms';
import {setOpacity} from './opacity';
import {setTransform} from './transform';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

export const drawElementToCanvas = async ({
	element,
	context,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
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

	const drawable =
		element instanceof SVGSVGElement
			? await turnSvgIntoDrawable(element)
			: element instanceof HTMLImageElement
				? element
				: element instanceof HTMLCanvasElement
					? element
					: null;

	if (background) {
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

	if (drawable) {
		context.drawImage(
			drawable,
			dimensions.left,
			dimensions.top,
			dimensions.width,
			dimensions.height,
		);
	}

	finishOpacity();
	finishBorderRadius();
	finishTransform();

	reset();
};
