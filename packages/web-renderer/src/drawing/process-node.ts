import {Internals, type LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {calculateTransforms} from './calculate-transforms';
import {getWiderRectAndExpand} from './clamp-rect-to-parent-bounds';
import {doRectsIntersect} from './do-rects-intersect';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {
	getPrecomposeRectFor3DTransform,
	handle3dTransform,
} from './handle-3d-transform';
import {getPrecomposeRectForMask, handleMask} from './handle-mask';
import {precomposeDOMElement} from './precompose';
import {roundToExpandRect} from './round-to-expand-rect';
import {transformDOMRect} from './transform-rect-with-matrix';

export type ProcessNodeReturnValue =
	| {type: 'continue'; cleanupAfterChildren: null | (() => void)}
	| {type: 'skip-children'};

export const processNode = async ({
	element,
	context,
	draw,
	logLevel,
	parentRect,
	internalState,
	rootElement,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	rootElement: HTMLElement | SVGElement;
}): Promise<ProcessNodeReturnValue> => {
	using transforms = calculateTransforms({
		element,
		rootElement,
	});

	const {opacity, computedStyle, totalMatrix, dimensions, precompositing} =
		transforms;
	if (opacity === 0) {
		return {type: 'skip-children'};
	}

	// When backfaceVisibility is 'hidden', don't render if the element is rotated
	// to show its backface. The backface is visible when the z-component of the
	// transformed normal vector (0, 0, 1) is negative, which corresponds to m33 < 0.
	if (computedStyle.backfaceVisibility === 'hidden' && totalMatrix.m33 < 0) {
		return {type: 'skip-children'};
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		return {type: 'continue', cleanupAfterChildren: null};
	}

	const rect = new DOMRect(
		dimensions.left - parentRect.x,
		dimensions.top - parentRect.y,
		dimensions.width,
		dimensions.height,
	);

	if (precompositing.needsPrecompositing) {
		const start = Date.now();

		let precomposeRect: DOMRect | null = null;
		if (precompositing.needsMaskImage) {
			precomposeRect = getWiderRectAndExpand({
				firstRect: precomposeRect,
				secondRect: getPrecomposeRectForMask(element),
			});
		}

		if (precompositing.needs3DTransformViaWebGL) {
			precomposeRect = getWiderRectAndExpand({
				firstRect: precomposeRect,
				secondRect: getPrecomposeRectFor3DTransform({
					element,
					parentRect,
					matrix: totalMatrix,
				}),
			});
		}

		if (!precomposeRect) {
			throw new Error('Precompose rect not found');
		}

		if (precomposeRect.width <= 0 || precomposeRect.height <= 0) {
			return {type: 'continue', cleanupAfterChildren: null};
		}

		if (!doRectsIntersect(precomposeRect, parentRect)) {
			return {type: 'continue', cleanupAfterChildren: null};
		}

		const {tempCanvas, tempContext} = await precomposeDOMElement({
			boundingRect: precomposeRect,
			element,
			logLevel,
			internalState,
		});

		let drawable: OffscreenCanvas | null = tempCanvas;

		const rectAfterTransforms = roundToExpandRect(
			transformDOMRect({
				rect: precomposeRect,
				matrix: totalMatrix,
			}),
		);

		if (precompositing.needsMaskImage) {
			handleMask({
				gradientInfo: precompositing.needsMaskImage,
				rect,
				precomposeRect,
				tempContext,
			});
		}

		if (precompositing.needs3DTransformViaWebGL) {
			const t = handle3dTransform({
				matrix: totalMatrix,
				precomposeRect,
				tempCanvas: drawable,
				rectAfterTransforms,
				internalState,
			});
			if (t) {
				drawable = t;
			}
		}

		const previousTransform = context.getTransform();
		if (drawable) {
			context.setTransform(new DOMMatrix());
			context.drawImage(
				drawable,
				0,
				drawable.height - rectAfterTransforms.height,
				rectAfterTransforms.width,
				rectAfterTransforms.height,
				rectAfterTransforms.left - parentRect.x,
				rectAfterTransforms.top - parentRect.y,
				rectAfterTransforms.width,
				rectAfterTransforms.height,
			);

			context.setTransform(previousTransform);

			Internals.Log.trace(
				{
					logLevel,
					tag: '@remotion/web-renderer',
				},
				`Transforming element in 3D - canvas size: ${precomposeRect.width}x${precomposeRect.height} - compose: ${Date.now() - start}ms`,
			);
			internalState.addPrecompose({
				canvasWidth: precomposeRect.width,
				canvasHeight: precomposeRect.height,
			});
		}

		return {type: 'skip-children'};
	}

	const {cleanupAfterChildren} = await drawElement({
		rect,
		computedStyle,
		context,
		draw,
		opacity,
		totalMatrix,
		parentRect,
		logLevel,
		element,
		internalState,
	});

	return {type: 'continue', cleanupAfterChildren};
};
