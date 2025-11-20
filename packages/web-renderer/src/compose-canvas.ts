import {calculateTransforms} from './calculate-transforms';
import {turnSvgIntoDrawable} from './compose-svg';

export const composeCanvas = async (
	canvas: HTMLCanvasElement | HTMLImageElement | SVGSVGElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const {totalMatrix, reset, dimensions, nativeTransformOrigin} =
		calculateTransforms(canvas);

	const translateX = nativeTransformOrigin.x + dimensions.left;
	const translateY = nativeTransformOrigin.y + dimensions.top;

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
