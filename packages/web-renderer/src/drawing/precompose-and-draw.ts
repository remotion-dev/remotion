import {type LogLevel, Internals} from 'remotion';
import type {InternalState} from '../internal-state';
import type {Precompositing} from './calculate-transforms';
import {getWiderRectAndExpand} from './clamp-rect-to-parent-bounds';
import {doRectsIntersect} from './do-rects-intersect';
import {getPrecomposeRectFor3DTransform} from './handle-3d-transform';
import {getPrecomposeRectForMask, handleMask} from './handle-mask';
import {precomposeDOMElement} from './precompose';
import {roundToExpandRect} from './round-to-expand-rect';
import {transformIn3d} from './transform-in-3d';
import {transformDOMRect} from './transform-rect-with-matrix';

export const precomposeAndDraw = async ({
	element,
	logLevel,
	parentRect,
	internalState,
	precompositing,
	totalMatrix,
	rect,
}: {
	element: HTMLElement | SVGElement;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	precompositing: Precompositing;
	totalMatrix: DOMMatrix;
	rect: DOMRect;
}) => {
	const start = Date.now();

	let precomposeRect: DOMRect | null = null;
	if (precompositing.needsMaskImage) {
		precomposeRect = roundToExpandRect(getPrecomposeRectForMask(element));
	}

	if (precompositing.needs3DTransformViaWebGL) {
		const tentativePrecomposeRect = getPrecomposeRectFor3DTransform({
			element,
			parentRect,
			matrix: totalMatrix,
		});
		if (!tentativePrecomposeRect) {
			return null;
		}

		precomposeRect = roundToExpandRect(
			getWiderRectAndExpand({
				firstRect: precomposeRect,
				secondRect: tentativePrecomposeRect,
			}),
		);
	}

	if (!precomposeRect) {
		throw new Error('Precompose rect not found');
	}

	if (precomposeRect.width <= 0 || precomposeRect.height <= 0) {
		return null;
	}

	if (!doRectsIntersect(precomposeRect, parentRect)) {
		return null;
	}

	const {tempCanvas, tempContext} = await precomposeDOMElement({
		boundingRect: precomposeRect,
		element,
		logLevel,
		internalState,
	});

	let drawable: OffscreenCanvas = tempCanvas;

	const rectAfterTransforms = roundToExpandRect(
		transformDOMRect({
			rect: precomposeRect,
			matrix: totalMatrix,
		}),
	);

	if (rectAfterTransforms.width <= 0 || rectAfterTransforms.height <= 0) {
		return null;
	}

	if (precompositing.needsMaskImage) {
		handleMask({
			gradientInfo: precompositing.needsMaskImage,
			rect,
			precomposeRect,
			tempContext,
		});
	}

	if (precompositing.needs3DTransformViaWebGL) {
		drawable = transformIn3d({
			matrix: totalMatrix,
			sourceRect: precomposeRect,
			sourceCanvas: drawable,
			destRect: rectAfterTransforms,
			internalState,
		});
	}

	Internals.Log.trace(
		{
			logLevel,
			tag: '@remotion/web-renderer',
		},
		`Transforming element in 3D - canvas size: ${precomposeRect.width}x${precomposeRect.height} - compose: ${Date.now() - start}ms - helper canvas: ${drawable.width}x${drawable.height}`,
	);
	internalState.addPrecompose({
		canvasWidth: precomposeRect.width,
		canvasHeight: precomposeRect.height,
	});

	return {drawable, rectAfterTransforms};
};
