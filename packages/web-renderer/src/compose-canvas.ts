import {calculateTransforms} from './calculate-transforms';
import {turnSvgIntoDrawable} from './compose-svg';

export const composeCanvas = async (
	canvas: HTMLCanvasElement | HTMLImageElement | SVGSVGElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const {totalMatrix, reset, dimensions} = calculateTransforms(canvas);

	context.setTransform(totalMatrix);
	const drawable =
		canvas instanceof SVGSVGElement
			? await turnSvgIntoDrawable(canvas)
			: canvas;

	context.drawImage(
		drawable,
		dimensions.left,
		dimensions.top,
		dimensions.width,
		dimensions.height,
	);
	context.setTransform(new DOMMatrix());

	reset();
};
