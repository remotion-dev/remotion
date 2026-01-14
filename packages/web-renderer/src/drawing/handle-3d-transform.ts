import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import {getNarrowerRect} from './clamp-rect-to-parent-bounds';
import {getPreTransformRect} from './get-pretransform-rect';

export const getPrecomposeRectFor3DTransform = ({
	element,
	parentRect,
	matrix,
}: {
	element: HTMLElement | SVGElement;
	parentRect: DOMRect;
	matrix: DOMMatrix;
}) => {
	const biggestPossiblePretransformRect = getPreTransformRect(
		parentRect,
		matrix,
	);
	if (!biggestPossiblePretransformRect) {
		return null;
	}

	const unclampedBiggestBoundingClientRect =
		getBiggestBoundingClientRect(element);

	const preTransformRect = getNarrowerRect({
		firstRect: unclampedBiggestBoundingClientRect,
		secondRect: biggestPossiblePretransformRect,
	});

	return preTransformRect;
};
