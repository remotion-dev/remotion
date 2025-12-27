import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {compose} from '../compose';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
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

	const start = Date.now();
	const tempCanvas = new OffscreenCanvas(
		Math.ceil(preTransformRect.width),
		Math.ceil(preTransformRect.height),
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
		logLevel,
		parentRect: preTransformRect,
		internalState,
	});
	const afterCompose = Date.now();

	const {canvas: transformed, rect: transformedRect} = transformIn3d({
		untransformedRect: preTransformRect,
		matrix: totalMatrix,
		sourceCanvas: tempCanvas,
	});

	context.drawImage(transformed, transformedRect.x, transformedRect.y);
	const afterDraw = Date.now();

	Internals.Log.trace(
		{
			logLevel,
			tag: '@remotion/web-renderer',
		},
		`Transforming element in 3D - canvas size: ${transformedRect.width}x${transformedRect.height} - compose: ${afterCompose - start}ms - draw: ${afterDraw - afterCompose}ms`,
	);
	internalState.add3DTransform({
		canvasWidth: Math.ceil(transformedRect.width),
		canvasHeight: Math.ceil(transformedRect.height),
	});
};
