import {setBorderRadius} from './border-radius';
import {calculateTransforms} from './calculate-transforms';
import {turnSvgIntoDrawable} from './compose-svg';

export const composeCanvas = async (
	canvas: HTMLCanvasElement | HTMLImageElement | SVGSVGElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const {totalMatrix, reset, dimensions, borderRadius} =
		calculateTransforms(canvas);

	context.setTransform(totalMatrix);
	const drawable =
		canvas instanceof SVGSVGElement
			? await turnSvgIntoDrawable(canvas)
			: canvas;

	const finish = setBorderRadius({
		ctx: context,
		x: dimensions.left,
		y: dimensions.top,
		width: dimensions.width,
		height: dimensions.height,
		borderRadius,
	});

	context.drawImage(
		drawable,
		dimensions.left,
		dimensions.top,
		dimensions.width,
		dimensions.height,
	);

	finish();
	context.setTransform(new DOMMatrix());

	reset();
};
