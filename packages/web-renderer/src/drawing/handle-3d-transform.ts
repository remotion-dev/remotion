import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import type {InternalState} from '../internal-state';
import {getNarrowerRect} from './clamp-rect-to-parent-bounds';
import {getPreTransformRect} from './get-pretransform-rect';
import {transformIn3d} from './transform-in-3d';

export const getPrecomposeRectFor3DTransform = ({
	element,
	parentRect,
	matrix,
}: {
	element: HTMLElement | SVGElement;
	parentRect: DOMRect;
	matrix: DOMMatrix;
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

	return preTransformRect;
};

export const handle3dTransform = ({
	matrix,
	sourceRect,
	tempCanvas,
	rectAfterTransforms,
	internalState,
}: {
	matrix: DOMMatrix;
	sourceRect: DOMRect;
	tempCanvas: OffscreenCanvas;
	rectAfterTransforms: DOMRect;
	internalState: InternalState;
}) => {
	const {canvas: transformed, rect: transformedRect} = transformIn3d({
		sourceRect,
		matrix,
		sourceCanvas: tempCanvas,
		destRect: rectAfterTransforms,
		internalState,
	});

	if (transformedRect.width <= 0 || transformedRect.height <= 0) {
		return null;
	}

	return transformed;
};
