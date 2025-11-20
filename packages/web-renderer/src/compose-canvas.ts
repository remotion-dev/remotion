import {calculateTransforms} from './calculate-transforms';
import {turnSvgIntoDrawable} from './compose-svg';

export const composeCanvas = async (
	canvas: HTMLCanvasElement | HTMLImageElement | SVGSVGElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const {totalMatrix, reset, dimensions} = calculateTransforms(canvas);

	const translateX = dimensions.left + dimensions.width / 2;
	const translateY = dimensions.top + dimensions.height / 2;

	const matrix = new DOMMatrix()
		.translate(translateX, translateY)
		.multiply(totalMatrix)
		.translate(-translateX, -translateY);

	context.setTransform(matrix);
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
