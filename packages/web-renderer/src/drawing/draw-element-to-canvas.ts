import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {compose} from '../compose';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
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
	logLevel,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	offsetLeft: number;
	offsetTop: number;
	logLevel: LogLevel;
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
		const biggestBoundingClientRect = getBiggestBoundingClientRect(element);
		const canvasOffsetLeft = Math.min(biggestBoundingClientRect.left, 0);
		const canvasOffsetTop = Math.min(biggestBoundingClientRect.top, 0);

		const tempCanvasWidth = Math.max(
			biggestBoundingClientRect.width,
			biggestBoundingClientRect.right,
		);
		const tempCanvasHeight = Math.max(
			biggestBoundingClientRect.height,
			biggestBoundingClientRect.bottom,
		);
		const start = Date.now();
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
			logLevel,
		});
		const afterCompose = Date.now();

		const transformed = transformIn3d({
			canvasWidth: tempCanvasWidth,
			canvasHeight: tempCanvasHeight,
			matrix: totalMatrix,
			sourceCanvas: tempCanvas,
			offsetLeft: canvasOffsetLeft,
			offsetTop: canvasOffsetTop,
		});
		context.drawImage(transformed, 0, 0);
		const afterDraw = Date.now();
		reset();

		Internals.Log.trace(
			{
				logLevel,
				tag: '@remotion/web-renderer',
			},
			`Transforming element in 3D - canvas size: ${tempCanvasWidth}x${tempCanvasHeight} - compose: ${afterCompose - start}ms - draw: ${afterDraw - afterCompose}ms`,
		);

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
