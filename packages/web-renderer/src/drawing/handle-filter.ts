import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import {splitAtTopLevel} from './background-image-rect';
import {getWiderRectAndExpand} from './clamp-rect-to-parent-bounds';
import {parseFilterOutsets} from './filter-outsets';
import {getSvgFilterGeometry, rebaseSvgFilter} from './svg-filter-geometry';

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
	const bounds = element.getBoundingClientRect();
	const geometry = getSvgFilterGeometry({
		filter,
		ownerDocument: element.ownerDocument,
		width: bounds.width,
		height: bounds.height,
	});
	if (geometry) {
		return getWiderRectAndExpand({
			firstRect: elementRect,
			secondRect: new DOMRect(
				bounds.left + geometry.rect.left,
				bounds.top + geometry.rect.top,
				geometry.rect.width,
				geometry.rect.height,
			),
		});
	}

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

// OffscreenCanvas cannot resolve DOM SVG filter references. Use a document-backed
// surface only for this filter stage, then feed it into the existing group draw.
export const applySvgFilterToPrecomposedCanvas = ({
	source,
	sourceRect,
	scale,
	filter,
	ownerDocument,
}: {
	source: OffscreenCanvas;
	sourceRect: DOMRect;
	scale: number;
	filter: string;
	ownerDocument: Document;
}) => {
	// Only graphs with qualified geometry use this document-backed stage.
	// Leave other URL filters on the existing draw path without cropping input.
	const geometry = getSvgFilterGeometry({
		filter,
		ownerDocument,
		width: sourceRect.width / scale,
		height: sourceRect.height / scale,
	});
	if (!geometry) return null;
	const rebased = rebaseSvgFilter({geometry, scale, ownerDocument});
	const canvas = ownerDocument.createElement('canvas');
	canvas.width = rebased.width;
	canvas.height = rebased.height;
	const dispose = () => {
		rebased[Symbol.dispose]();
		canvas.width = 0;
		canvas.height = 0;
	};

	try {
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Could not get SVG filter context');
		context.filter = rebased.filter;
		context.drawImage(
			source,
			-sourceRect.left - rebased.left,
			-sourceRect.top - rebased.top,
		);
	} catch (error) {
		dispose();
		throw error;
	}

	return {
		canvas,
		sourceX: -sourceRect.left - rebased.left,
		sourceY: -sourceRect.top - rebased.top,
		[Symbol.dispose]: dispose,
	};
};
