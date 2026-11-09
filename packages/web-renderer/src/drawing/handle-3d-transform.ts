import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {getNarrowerRect} from './clamp-rect-to-parent-bounds';
import {
	clipSourceRectToViewport,
	isScaleTooBig,
	getPreTransformRect,
} from './get-pretransform-rect';
import {transformIn3d} from './transform-in-3d';

export const getPrecomposeRectFor3DTransform = ({
	element,
	parentRect,
	matrix,
	onlyOwnPlane = false,
	experimental3DRendering = false,
	sourceRect,
}: {
	element: HTMLElement | SVGElement;
	parentRect: DOMRect;
	matrix: DOMMatrix;
	onlyOwnPlane?: boolean;
	experimental3DRendering?: boolean;
	sourceRect: DOMRect | null;
}) => {
	const unclampedBiggestBoundingClientRect =
		sourceRect ??
		getBiggestBoundingClientRect(element, true, experimental3DRendering, {
			onlyOwnPlane,
			experimental3DRendering,
		});
	if (!experimental3DRendering) {
		const sourceBounds = getPreTransformRect(parentRect, matrix);
		return sourceBounds
			? getNarrowerRect({
					firstRect: unclampedBiggestBoundingClientRect,
					secondRect: sourceBounds,
				})
			: null;
	}

	if (isScaleTooBig(matrix)) return null;
	return clipSourceRectToViewport(
		unclampedBiggestBoundingClientRect,
		matrix,
		parentRect,
	);
};

export const handle3dTransform = ({
	matrix,
	sourceRect,
	tempCanvas,
	rectAfterTransforms,
	internalState,
	scale,
}: {
	matrix: DOMMatrix;
	sourceRect: DOMRect;
	tempCanvas: OffscreenCanvas;
	rectAfterTransforms: DOMRect;
	internalState: InternalState;
	scale: number;
}) => {
	if (rectAfterTransforms.width <= 0 || rectAfterTransforms.height <= 0) {
		return null;
	}

	const transformed = transformIn3d({
		sourceRect,
		matrix,
		sourceCanvas: tempCanvas,
		destRect: rectAfterTransforms,
		internalState,
		scale,
	});

	return transformed;
};
