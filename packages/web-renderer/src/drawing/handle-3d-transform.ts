import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {getNarrowerRect} from './clamp-rect-to-parent-bounds';
import {doRectsIntersect} from './do-rects-intersect';
import {getPreTransformRect} from './get-pretransform-rect';
import {precomposeDOMElement} from './precompose';
import {roundToExpandRect} from './round-to-expand-rect';
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
	const preTransformRect = roundToExpandRect(
		getNarrowerRect({
			firstRect: unclampedBiggestBoundingClientRect,
			secondRect: biggestPossiblePretransformRect,
		}),
	);

	if (preTransformRect.width <= 0 || preTransformRect.height <= 0) {
		return;
	}

	if (!doRectsIntersect(preTransformRect, parentRect)) {
		return;
	}

	const start = Date.now();
	const {tempCanvas} = await precomposeDOMElement({
		boundingRect: preTransformRect,
		element,
		logLevel,
		internalState,
	});

	const afterCompose = Date.now();

	const {canvas: transformed, rect: transformedRect} = transformIn3d({
		untransformedRect: preTransformRect,
		matrix,
		sourceCanvas: tempCanvas,
	});

	if (transformedRect.width <= 0 || transformedRect.height <= 0) {
		return;
	}

	context.drawImage(
		transformed,
		transformedRect.x - parentRect.x,
		transformedRect.y - parentRect.y,
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
		canvasWidth: transformedRect.width,
		canvasHeight: transformedRect.height,
	});
};
