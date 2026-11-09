import {Internals, type LogLevel} from 'remotion';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {createLayer} from '../take-screenshot';
import {
	calculateTransforms,
	type TransformStyleCache,
} from './calculate-transforms';
import {getWiderRectAndExpand} from './clamp-rect-to-parent-bounds';
import {doRectsIntersect} from './do-rects-intersect';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {parseFilterOutsets} from './filter-outsets';
import {getPrecomposedLayerGeometry} from './get-precomposed-layer-geometry';
import {
	clipSourceRectToViewport,
	projectSourceRectToViewport,
} from './get-pretransform-rect';
import {
	getPrecomposeRectFor3DTransform,
	handle3dTransform,
} from './handle-3d-transform';
import {
	applyFilterToDrawOperation,
	scaleFilterLengths,
	getPrecomposeRectForFilter,
} from './handle-filter';
import {
	getPrecomposeRectForMask,
	handleMask,
	handleSvgClip,
} from './handle-mask';
import {setOpacity} from './opacity';
import {roundToExpandRect} from './round-to-expand-rect';
import {scaleRect} from './scale-rect';
import {setTransform} from './transform';
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
	scale,
	waitForPageResponsiveness,
	transformStyleCache,
	isolatedElements,
	forceSubtreePrecompositing = false,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	rootElement: HTMLElement | SVGElement;
	scale: number;
	waitForPageResponsiveness: (() => Promise<void>) | null;
	transformStyleCache: TransformStyleCache;
	isolatedElements: WeakSet<Element>;
	forceSubtreePrecompositing?: boolean;
}): Promise<ProcessNodeReturnValue> => {
	using transforms = calculateTransforms({
		element,
		rootElement,
		transformStyleCache,
		isolated: isolatedElements.has(element),
		experimental3DRendering: internalState.experimental3DRendering,
	});

	const {opacity, computedStyle, totalMatrix, dimensions, precompositing} =
		transforms;
	if (forceSubtreePrecompositing) precompositing.needsPrecompositing = true;
	if (opacity === 0) {
		return {type: 'skip-children'};
	}

	// When backfaceVisibility is 'hidden', don't render if the element is rotated
	// to show its backface. The backface is visible when the z-component of the
	// transformed normal vector (0, 0, 1) is negative, which corresponds to m33 < 0.
	if (computedStyle.backfaceVisibility === 'hidden' && totalMatrix.m33 < 0) {
		return {type: 'skip-children'};
	}

	if (
		!forceSubtreePrecompositing &&
		(dimensions.width <= 0 || dimensions.height <= 0)
	) {
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
		const filterBounds = precompositing.needsFilterPrecompositing
			? getPrecomposeRectForFilter({
					element,
					filter: precompositing.needsFilterPrecompositing,
				})
			: null;
		// Include offscreen inputs before the perspective path can reject them.
		const outsets =
			internalState.experimental3DRendering &&
			precompositing.needsFilterPrecompositing
				? parseFilterOutsets(precompositing.needsFilterPrecompositing)
				: {left: 0, right: 0, top: 0, bottom: 0};
		const captureViewport = internalState.experimental3DRendering
			? new DOMRect(
					parentRect.left - outsets.right,
					parentRect.top - outsets.bottom,
					parentRect.width + outsets.left + outsets.right,
					parentRect.height + outsets.top + outsets.bottom,
				)
			: parentRect;

		let precomposeRect: DOMRect | null = null;
		let projectedRect: DOMRect | null = null;
		if (
			internalState.experimental3DRendering &&
			(precompositing.needsOpacityPrecompositing || forceSubtreePrecompositing)
		) {
			precomposeRect = roundToExpandRect(
				getBiggestBoundingClientRect(
					element,
					true,
					internalState.experimental3DRendering,
					{experimental3DRendering: internalState.experimental3DRendering},
				),
			);
		}

		if (precompositing.needsMaskImage || precompositing.needsSvgClip) {
			precomposeRect = roundToExpandRect(getPrecomposeRectForMask(element));
		}

		if (precompositing.needs3DTransformViaWebGL) {
			const tentativePrecomposeRect = getPrecomposeRectFor3DTransform({
				element,
				parentRect: captureViewport,
				matrix: totalMatrix,
				onlyOwnPlane: transforms.preserves3DChildren,
				experimental3DRendering: internalState.experimental3DRendering,
				sourceRect:
					internalState.experimental3DRendering && filterBounds
						? getWiderRectAndExpand({
								firstRect: precomposeRect,
								secondRect: filterBounds,
							})
						: null,
			});
			if (!tentativePrecomposeRect) {
				return {type: 'continue', cleanupAfterChildren: null};
			}

			precomposeRect = roundToExpandRect(
				getWiderRectAndExpand({
					firstRect: precomposeRect,
					secondRect: tentativePrecomposeRect,
				}),
			);
		}

		if (filterBounds) {
			precomposeRect = roundToExpandRect(
				getWiderRectAndExpand({
					firstRect: precomposeRect,
					secondRect: filterBounds,
				}),
			);
		}

		const needsGroup =
			precompositing.needsBlendMode !== null ||
			precompositing.needsIsolation ||
			precompositing.needsSvgClip !== null;

		if (needsGroup) {
			precomposeRect = roundToExpandRect(
				getWiderRectAndExpand({
					firstRect: precomposeRect,
					secondRect: getBiggestBoundingClientRect(
						element,
						true,
						precompositing.needsSvgClip !== null ||
							internalState.experimental3DRendering,
						{experimental3DRendering: internalState.experimental3DRendering},
					),
				}),
			);
		}

		if (!precomposeRect) {
			throw new Error('Precompose rect not found');
		}

		if (internalState.experimental3DRendering) {
			// Clip after every bounds union, including opacity and filter groups.
			// Keep nearby offscreen input that can cast a drop-shadow into the viewport.
			const visibleSourceRect = clipSourceRectToViewport(
				precomposeRect,
				totalMatrix,
				captureViewport,
			);
			if (!visibleSourceRect)
				return {
					type: transforms.preserves3DChildren ? 'continue' : 'skip-children',
					cleanupAfterChildren: null,
				};
			precomposeRect = roundToExpandRect(visibleSourceRect);
			projectedRect = projectSourceRectToViewport(
				precomposeRect,
				totalMatrix,
				captureViewport,
			);
		}

		if (precomposeRect.width <= 0 || precomposeRect.height <= 0) {
			return {type: 'continue', cleanupAfterChildren: null};
		}

		// The source cutout is in untransformed layout coordinates. Test its
		// projected destination against the viewport when applying a 3D matrix.
		if (
			!doRectsIntersect(
				internalState.experimental3DRendering ? projectedRect! : precomposeRect,
				parentRect,
			)
		) {
			return {type: 'continue', cleanupAfterChildren: null};
		}

		const preserves3D = transforms.preserves3DChildren;
		const is3DPrecomposition = precompositing.needs3DTransformViaWebGL;

		const {
			rect: layerRect,
			scale: layerScale,
			pixelWidth: layerPixelWidth,
			pixelHeight: layerPixelHeight,
		} = getPrecomposedLayerGeometry({
			precomposeRect,
			totalMatrix,
			parentRect,
			scale,
			is3DPrecomposition,
		});

		const tempContext = await createLayer({
			cutout: layerRect,
			onlyOwnPlane: preserves3D,
			element,
			logLevel,
			internalState,
			scale: layerScale,
			onlyBackgroundClipText: false,
			waitForPageResponsiveness,
		});
		if (waitForPageResponsiveness !== null) {
			await waitForPageResponsiveness();
		}

		let drawable: OffscreenCanvas | null = tempContext.canvas;

		const rectAfterTransforms = roundToExpandRect(
			scaleRect({
				scale,
				rect:
					projectedRect ??
					transformDOMRect({
						rect: precomposeRect,
						matrix: totalMatrix,
					}),
			}),
		);

		if (precompositing.needsFilterPrecompositing) {
			tempContext.save();
			tempContext.resetTransform();
			tempContext.globalAlpha = 1;
			tempContext.globalCompositeOperation = 'copy';
			applyFilterToDrawOperation({
				context: tempContext,
				filter: scaleFilterLengths(
					precompositing.needsFilterPrecompositing,
					layerScale,
				),
				drawFn: () => tempContext.drawImage(tempContext.canvas, 0, 0),
			});
			tempContext.restore();
		}

		if (precompositing.needsSvgClip) {
			await handleSvgClip({
				element,
				resource: precompositing.needsSvgClip,
				maskRect: dimensions,
				precomposeRect: layerRect,
				tempContext,
			});
		}

		if (precompositing.needsMaskImage) {
			await handleMask({
				maskImageInfo: precompositing.needsMaskImage,
				maskRect: dimensions,
				precomposeRect: layerRect,
				tempContext,
				scale: layerScale,
				internalState,
			});
			if (waitForPageResponsiveness !== null) {
				await waitForPageResponsiveness();
			}
		}

		if (precompositing.needs3DTransformViaWebGL) {
			const t = handle3dTransform({
				matrix: totalMatrix,
				sourceRect: precomposeRect,
				tempCanvas: drawable,
				rectAfterTransforms,
				internalState,
				scale,
			});
			if (t) {
				drawable = t;
			}

			if (waitForPageResponsiveness !== null) {
				await waitForPageResponsiveness();
			}
		}

		const previousTransform = context.getTransform();

		if (is3DPrecomposition) {
			context.setTransform(new DOMMatrix());
		} else {
			// Preserve 2D rotation and skew instead of stretching the layer into
			// the axis-aligned bounds of its transformed corners.
			setTransform({
				ctx: context,
				transform: totalMatrix,
				parentRect,
				scale,
			});
		}

		const destinationRect = is3DPrecomposition
			? rectAfterTransforms
			: layerRect;
		const parentOffsetScale = is3DPrecomposition ? scale : 1;

		const drawPrecomposedCanvas = () => {
			context.drawImage(
				drawable,
				0,
				0,
				layerPixelWidth ?? drawable.width,
				layerPixelHeight ?? drawable.height,
				destinationRect.left - parentRect.x * parentOffsetScale,
				destinationRect.top - parentRect.y * parentOffsetScale,
				destinationRect.width,
				destinationRect.height,
			);
		};

		const previousCompositeOperation = context.globalCompositeOperation;
		if (precompositing.needsBlendMode !== null) {
			context.globalCompositeOperation = precompositing.needsBlendMode;
		}

		const finishOpacity =
			needsGroup || precompositing.needsOpacityPrecompositing
				? setOpacity({ctx: context, opacity})
				: () => {};

		try {
			drawPrecomposedCanvas();
		} finally {
			finishOpacity();
			context.globalCompositeOperation = previousCompositeOperation;
			context.setTransform(previousTransform);
		}

		if (waitForPageResponsiveness !== null) {
			await waitForPageResponsiveness();
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

		return {
			type: preserves3D ? 'continue' : 'skip-children',
			cleanupAfterChildren: null,
		};
	}

	const {cleanupAfterChildren} = await drawElement({
		rect,
		computedStyle,
		context,
		draw,
		opacity,
		totalMatrix,
		hasCssTransform: transforms.hasCssTransform,
		parentRect,
		logLevel,
		element,
		internalState,
		scale,
	});

	return {type: 'continue', cleanupAfterChildren};
};
