import {setBorderRadius} from './border-radius';
import {calculateTransforms} from './calculate-transforms';
import {setOpacity} from './opacity';
import {setTransform} from './transform';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

export const drawElementToCanvas = async (
	element: HTMLCanvasElement | HTMLImageElement | SVGSVGElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const {totalMatrix, reset, dimensions, borderRadius, opacity} =
		calculateTransforms(element);

	if (opacity === 0) {
		reset();
		return;
	}

	const drawable =
		element instanceof SVGSVGElement
			? await turnSvgIntoDrawable(element)
			: element;

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

	context.drawImage(
		drawable,
		dimensions.left,
		dimensions.top,
		dimensions.width,
		dimensions.height,
	);

	finishOpacity();
	finishBorderRadius();
	finishTransform();

	reset();
};
