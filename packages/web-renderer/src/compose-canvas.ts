import {setBorderRadius} from './border-radius';
import {calculateTransforms} from './calculate-transforms';
import {turnSvgIntoDrawable} from './compose-svg';
import {setOpacity} from './drawing/opacity';
import {setTransform} from './transform';

export const composeCanvas = async (
	canvas: HTMLCanvasElement | HTMLImageElement | SVGSVGElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const {totalMatrix, reset, dimensions, borderRadius, opacity} =
		calculateTransforms(canvas);

	if (opacity === 0) {
		reset();
		return;
	}

	const drawable =
		canvas instanceof SVGSVGElement
			? await turnSvgIntoDrawable(canvas)
			: canvas;

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
