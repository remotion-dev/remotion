import type {InternalState} from '../internal-state';
import {getCanvasContextOptions} from './canvas-context-options';
import type {LinearGradientInfo} from './parse-linear-gradient';
import {createCanvasGradient} from './parse-linear-gradient';

export const getLinearGradientFill = ({
	contextToDraw,
	rect,
	gradientInfo,
	offsetLeft,
	offsetTop,
	internalState,
}: {
	contextToDraw: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	gradientInfo: LinearGradientInfo;
	offsetLeft: number;
	offsetTop: number;
	internalState: InternalState;
}): CanvasGradient | CanvasPattern | null => {
	const {gradient, hasInterpolation} = createCanvasGradient({
		ctx: contextToDraw,
		rect,
		gradientInfo,
		offsetLeft,
		offsetTop,
	});
	if (hasInterpolation) return gradient;
	const options = getCanvasContextOptions(internalState, true);
	if (options.willReadFrequently) {
		const canvas = new OffscreenCanvas(
			contextToDraw.canvas.width,
			contextToDraw.canvas.height,
		);
		try {
			const context = canvas.getContext('2d', options);
			if (!context) throw new Error('Could not get linear gradient context');
			const transform = contextToDraw.getTransform();
			context.setTransform(transform);
			context.fillStyle = createCanvasGradient({
				ctx: context,
				rect,
				gradientInfo,
				offsetLeft,
				offsetTop,
			}).gradient;
			const inverse = transform.inverse();
			context.beginPath();
			for (const [index, [x, y]] of [
				[0, 0],
				[canvas.width, 0],
				[canvas.width, canvas.height],
				[0, canvas.height],
			].entries()) {
				const point = new DOMPoint(x, y).matrixTransform(inverse);
				if (index === 0) context.moveTo(point.x, point.y);
				else context.lineTo(point.x, point.y);
			}

			context.closePath();
			context.fill();
			const pattern = contextToDraw.createPattern(canvas, 'no-repeat');
			pattern?.setTransform(transform.inverse());
			return pattern;
		} finally {
			canvas.width = 0;
			canvas.height = 0;
		}
	}

	return gradient;
};
