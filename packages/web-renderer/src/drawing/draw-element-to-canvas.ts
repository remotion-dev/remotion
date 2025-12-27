import type {LogLevel} from 'remotion';
import {calculateTransforms} from './calculate-transforms';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {handle3dTransform} from './handle-3d-transform';

export type DrawElementToCanvasReturnValue = 'continue' | 'skip-children';

export const drawElementToCanvas = async ({
	element,
	context,
	draw,
	offsetLeft,
	offsetTop,
	logLevel,
	parentRect,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	offsetLeft: number;
	offsetTop: number;
	logLevel: LogLevel;
	parentRect: DOMRect;
}): Promise<DrawElementToCanvasReturnValue> => {
	const {totalMatrix, reset, dimensions, opacity, computedStyle} =
		calculateTransforms({element, offsetLeft, offsetTop});

	if (opacity === 0) {
		reset();
		return 'continue';
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		reset();
		return 'continue';
	}

	if (!totalMatrix.is2D) {
		await handle3dTransform({
			element,
			totalMatrix,
			parentRect,
			context,
			logLevel,
		});
		reset();
		return 'skip-children';
	}

	await drawElement({
		dimensions: new DOMRect(
			dimensions.left - offsetLeft,
			dimensions.top - offsetTop,
			dimensions.width,
			dimensions.height,
		),
		computedStyle,
		context,
		draw,
		opacity,
		totalMatrix,
	});

	reset();

	return 'continue';
};
