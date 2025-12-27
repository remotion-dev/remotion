import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {compose} from '../compose';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {canvasOffsetFromRect} from './canvas-offset-from-rect';
import {clampRectToParentBounds} from './clamp-rect-to-parent-bounds';
import {getPreTransformRect} from './get-pretransform-rect';
import {transformIn3d} from './transform-in-3d';

export const handle3dTransform = async ({
	element,
	totalMatrix,
	parentRect,
	context,
	logLevel,
	internalState,
}: {
	element: HTMLElement | SVGElement;
	totalMatrix: DOMMatrix;
	parentRect: DOMRect;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
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
		internalState,
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

	Internals.Log.trace(
		{
			logLevel,
			tag: '@remotion/web-renderer',
		},
		`Transforming element in 3D - canvas size: ${offsetAfterTransforms.canvasWidth}x${offsetAfterTransforms.canvasHeight} - compose: ${afterCompose - start}ms - draw: ${afterDraw - afterCompose}ms`,
	);
	internalState.add3DTransform({
		canvasWidth: offsetAfterTransforms.canvasWidth,
		canvasHeight: offsetAfterTransforms.canvasHeight,
	});
};
