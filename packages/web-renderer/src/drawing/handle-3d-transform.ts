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
	precomposeRect,
	tempCanvas,
	rectAfterTransforms,
	internalState,
	transformedTopLeft,
	transformedTopRight,
	transformedBottomLeft,
	transformedBottomRight,
}: {
	matrix: DOMMatrix;
	precomposeRect: DOMRect;
	tempCanvas: OffscreenCanvas;
	rectAfterTransforms: DOMRect;
	internalState: InternalState;
	transformedTopLeft: DOMPointReadOnly;
	transformedTopRight: DOMPointReadOnly;
	transformedBottomLeft: DOMPointReadOnly;
	transformedBottomRight: DOMPointReadOnly;
}) => {
	const {canvas: transformed, rect: transformedRect} = transformIn3d({
		untransformedRect: precomposeRect,
		matrix,
		sourceCanvas: tempCanvas,
		rectAfterTransforms,
		internalState,
		transformedTopLeft,
		transformedTopRight,
		transformedBottomLeft,
		transformedBottomRight,
	});

	if (transformedRect.width <= 0 || transformedRect.height <= 0) {
		return null;
	}

	return transformed;
};
