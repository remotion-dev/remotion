import {calculateTransforms} from './calculate-transforms';

export const composeCanvas = (
	canvas: HTMLCanvasElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const {totalMatrix, reset, svgDimensions, nativeTransformOrigin} =
		calculateTransforms(canvas);

	const translateX = nativeTransformOrigin.x + svgDimensions.left;
	const translateY = nativeTransformOrigin.y + svgDimensions.top;

	const matrix = new DOMMatrix()
		.translate(translateX, translateY)
		.multiply(totalMatrix)
		.translate(-translateX, -translateY);

	context.setTransform(matrix);
	context.drawImage(canvas, svgDimensions.left, svgDimensions.top);

	reset();
};
