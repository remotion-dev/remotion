import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import {splitAtTopLevel} from './background-image-rect';
import {parseFilterOutsets} from './filter-outsets';

/**
 * Gets the precompose rect for an element with a filter that requires precompositing.
 * Expands the element's bounding rect (including all children) to accommodate drop-shadow spread.
 */
export const getPrecomposeRectForFilter = ({
	element,
	filter,
}: {
	element: HTMLElement | SVGElement;
	filter: string;
}): DOMRect => {
	// Use getBiggestBoundingClientRect to include all children that may overflow
	const elementRect = getBiggestBoundingClientRect(element);
	const expansion = parseFilterOutsets(filter);

	return new DOMRect(
		elementRect.left - expansion.left,
		elementRect.top - expansion.top,
		elementRect.width + expansion.left + expansion.right,
		elementRect.height + expansion.top + expansion.bottom,
	);
};

/**
 * Applies a filter when drawing a precomposed canvas to the main context.
 */
export const applyFilterToDrawOperation = ({
	context,
	filter,
	drawFn,
}: {
	context: OffscreenCanvasRenderingContext2D;
	filter: string;
	drawFn: () => void;
}) => {
	const previousFilter = context.filter;
	context.filter = filter;
	drawFn();
	context.filter = previousFilter;
};

// Canvas filter lengths use bitmap pixels independently of the context transform.
export const scaleFilterLengths = (filter: string, scale: number) => {
	if (scale === 1) return filter;
	return splitAtTopLevel(filter, ' ')
		.map((operation) =>
			operation.startsWith('url(')
				? operation
				: operation.replace(
						/([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)px/gi,
						(_, value: string) => `${Number(value) * scale}px`,
					),
		)
		.join(' ');
};
