import {
	getNarrowerRect,
	getWiderRectAndExpand,
} from './clamp-rect-to-parent-bounds';
import type {parseFilterOutsets} from './filter-outsets';
import {clipSourceRectToViewport} from './get-pretransform-rect';

export const getFilterCaptureRect = ({
	paintBounds,
	matrix,
	viewport,
	previousCapture,
	outsets,
}: {
	paintBounds: DOMRect;
	matrix: DOMMatrix;
	viewport: DOMRect;
	previousCapture: DOMRect | null;
	outsets: ReturnType<typeof parseFilterOutsets>;
}) => {
	const visiblePaint = clipSourceRectToViewport(paintBounds, matrix, viewport);
	if (!visiblePaint) return previousCapture;

	// A visible output pixel can depend on input on the opposite side of
	// the filter's local extent. Compute that dependency after clipping the
	// output in homogeneous coordinates, while the bounds are still local.
	const inputRegion = new DOMRect(
		visiblePaint.left - outsets.right,
		visiblePaint.top - outsets.bottom,
		visiblePaint.width + outsets.left + outsets.right,
		visiblePaint.height + outsets.top + outsets.bottom,
	);
	const requiredCapture = getNarrowerRect({
		firstRect: paintBounds,
		secondRect: inputRegion,
	});
	return getWiderRectAndExpand({
		firstRect: previousCapture,
		secondRect: requiredCapture,
	});
};
