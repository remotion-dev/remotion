import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {compose} from '../compose';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {getNarrowerRect} from './clamp-rect-to-parent-bounds';
import {doRectsIntersect} from './do-rects-intersect';
import {getPreTransformRect} from './get-pretransform-rect';
import {transformIn3d} from './transform-in-3d';

export const handle3dTransform = async ({
	element,
	matrix,
	parentRect,
	context,
	logLevel,
	internalState,
}: {
	element: HTMLElement | SVGElement;
	matrix: DOMMatrix;
	parentRect: DOMRect;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
	const unclampedBiggestBoundingClientRect =
		getBiggestBoundingClientRect(element);

	const biggestPossiblePretransformRect = getPreTransformRect(
		parentRect,
		matrix,
	);
	const preTransformRect = getNarrowerRect({
		firstRect: unclampedBiggestBoundingClientRect,
		secondRect: biggestPossiblePretransformRect,
	});

	if (preTransformRect.width <= 0 || preTransformRect.height <= 0) {
		return;
	}

	if (!doRectsIntersect(preTransformRect, parentRect)) {
		return;
	}

	const start = Date.now();
	const tempCanvas = new OffscreenCanvas(
		Math.ceil(preTransformRect.width),
		Math.ceil(preTransformRect.height),
	);

	await compose({
		element,
		context: tempCanvas.getContext('2d')!,
		logLevel,
		parentRect: preTransformRect,
		internalState,
	});
	const afterCompose = Date.now();

	const {canvas: transformed, rect: transformedRect} = transformIn3d({
		untransformedRect: preTransformRect,
		matrix,
		sourceCanvas: tempCanvas,
	});

	context.drawImage(
		transformed,
		Math.round(transformedRect.x - parentRect.x),
		Math.round(transformedRect.y - parentRect.y),
	);

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
