import {calculateTransforms} from './calculate-transforms';

export const composeCanvas = (
	canvas: HTMLCanvasElement,
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
	context.drawImage(
		canvas,
		dimensions.left,
		dimensions.top,
		dimensions.width,
		dimensions.height,
	);
	context.setTransform(new DOMMatrix());

	reset();
};
