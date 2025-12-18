import {compose} from '../compose';
import {calculateTransforms} from './calculate-transforms';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {transformIn3d} from './transform-in-3d';

export type DrawElementToCanvasReturnValue = 'continue' | 'skip-children';

export const drawElementToCanvas = async ({
	element,
	context,
	draw,
	offsetLeft,
	offsetTop,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	offsetLeft: number;
	offsetTop: number;
}): Promise<DrawElementToCanvasReturnValue> => {
	const {totalMatrix, reset, dimensions, opacity, computedStyle} =
		calculateTransforms(element);

	if (opacity === 0) {
		reset();
		return 'continue';
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		reset();
		return 'continue';
	}

	if (!totalMatrix.is2D) {
		const canvasOffsetLeft = Math.min(dimensions.left, 0);
		const canvasOffsetTop = Math.min(dimensions.top, 0);

		const tempCanvasWidth = Math.max(dimensions.width, dimensions.right);
		const tempCanvasHeight = Math.max(dimensions.height, dimensions.bottom);
		const tempCanvas = new OffscreenCanvas(tempCanvasWidth, tempCanvasHeight);
		const context2 = tempCanvas.getContext('2d');
		if (!context2) {
			throw new Error('Could not get context');
		}

		await compose({
			element,
			context: context2,
			offsetLeft: canvasOffsetLeft,
			offsetTop: canvasOffsetTop,
		});

		const transformed = transformIn3d({
			canvasWidth: tempCanvasWidth,
			canvasHeight: tempCanvasHeight,
			matrix: totalMatrix,
			sourceCanvas: tempCanvas,
			offsetLeft: canvasOffsetLeft,
			offsetTop: canvasOffsetTop,
		});
		context.drawImage(transformed, 0, 0);
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
