import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {compose} from '../compose';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import {calculateTransforms} from './calculate-transforms';
import {canvasOffsetFromRect} from './canvas-offset-from-rect';
import {clampRectToParentBounds} from './clamp-rect-to-parent-bounds';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {getPreTransformRect} from './get-pretransform-rect';
import {transformIn3d} from './transform-in-3d';

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
		const unclampedBiggestBoundingClientRect =
			getBiggestBoundingClientRect(element);
		const biggestBoundingClientRect = clampRectToParentBounds({
			rect: unclampedBiggestBoundingClientRect,
			parentRect,
		});
		const preTransformRect = clampRectToParentBounds({
			rect: getPreTransformRect(biggestBoundingClientRect, totalMatrix),
			parentRect: unclampedBiggestBoundingClientRect,
		});

		const offsetBeforeTransforms = canvasOffsetFromRect({
			rect: preTransformRect,
		});

		const offsetAfterTransforms = canvasOffsetFromRect({
			rect: biggestBoundingClientRect,
		});

		const start = Date.now();
		const tempCanvas = new OffscreenCanvas(
			Math.ceil(offsetBeforeTransforms.canvasWidth),
			Math.ceil(offsetBeforeTransforms.canvasHeight),
		);
		const context2 = tempCanvas.getContext('2d', {
			alpha: true,
		});
		if (!context2) {
			throw new Error('Could not get context');
		}

		await compose({
			element,
			context: context2,
			offsetLeft: offsetBeforeTransforms.offsetLeft,
			offsetTop: offsetBeforeTransforms.offsetTop,
			logLevel,
			parentRect: preTransformRect,
		});
		const afterCompose = Date.now();

		const transformed = transformIn3d({
			beforeTransformCanvasWidth: offsetBeforeTransforms.canvasWidth,
			beforeTransformCanvasHeight: offsetBeforeTransforms.canvasHeight,
			matrix: totalMatrix,
			sourceCanvas: tempCanvas,
			beforeTransformOffsetLeft: offsetBeforeTransforms.offsetLeft,
			beforeTransformOffsetTop: offsetBeforeTransforms.offsetTop,
			canvasWidth: offsetAfterTransforms.canvasWidth,
			canvasHeight: offsetAfterTransforms.canvasHeight,
		});
		context.drawImage(transformed, 0, 0);
		const afterDraw = Date.now();
		reset();

		Internals.Log.trace(
			{
				logLevel,
				tag: '@remotion/web-renderer',
			},
			`Transforming element in 3D - canvas size: ${offsetAfterTransforms.canvasWidth}x${offsetAfterTransforms.canvasHeight} - compose: ${afterCompose - start}ms - draw: ${afterDraw - afterCompose}ms`,
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
