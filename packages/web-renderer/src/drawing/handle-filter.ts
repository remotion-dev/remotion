import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import {getWiderRectAndExpand} from './clamp-rect-to-parent-bounds';
import {getSvgFilterGeometry, rebaseSvgFilter} from './svg-filter-geometry';

/**
 * Parses drop-shadow values from a CSS filter string to calculate
 * how much the precompose rect needs to be expanded.
 */
const parseDropShadowExpansion = (
	filter: string,
): {left: number; right: number; top: number; bottom: number} => {
	const expansion = {left: 0, right: 0, top: 0, bottom: 0};

	// Match drop-shadow function with support for nested parentheses (e.g., rgba() inside drop-shadow())
	// getComputedStyle returns colors as rgb()/rgba(), so we need to handle one level of nesting
	const dropShadowRegex = /drop-shadow\(((?:[^()]+|\([^()]*\))+)\)/gi;
	let match;

	while ((match = dropShadowRegex.exec(filter)) !== null) {
		const params = match[1].trim();

		// Extract numeric values (offsets and blur)
		// The values can be in pixels, and we need to handle negative values
		const numbers: number[] = [];
		const numberRegex = /([+-]?\d*\.?\d+)(?:px)?/g;
		let numMatch;
		while ((numMatch = numberRegex.exec(params)) !== null) {
			// Skip if this is part of a color (like rgb values)
			const beforeMatch = params.slice(0, numMatch.index);
			if (!/(?:rgba?|hsla?)\([^)]*$/i.test(beforeMatch)) {
				numbers.push(parseFloat(numMatch[1]));
			}
		}

		// drop-shadow takes: offset-x, offset-y, [blur-radius]
		// Standard order is: offset-x offset-y blur color
		// or: offset-x offset-y color
		if (numbers.length >= 2) {
			const offsetX = numbers[0];
			const offsetY = numbers[1];
			const blurRadius = numbers.length >= 3 ? numbers[2] : 0;

			// Expand the rect to account for shadow offset and blur
			// CSS drop-shadow blur-radius is a Gaussian standard deviation
			// Visible extent is approximately 3σ, so we multiply by 3
			const blurSpread = blurRadius * 3;

			if (offsetX > 0) {
				expansion.right = Math.max(expansion.right, offsetX + blurSpread);
				expansion.left = Math.max(expansion.left, blurSpread);
			} else {
				expansion.left = Math.max(
					expansion.left,
					Math.abs(offsetX) + blurSpread,
				);
				expansion.right = Math.max(expansion.right, blurSpread);
			}

			if (offsetY > 0) {
				expansion.bottom = Math.max(expansion.bottom, offsetY + blurSpread);
				expansion.top = Math.max(expansion.top, blurSpread);
			} else {
				expansion.top = Math.max(expansion.top, Math.abs(offsetY) + blurSpread);
				expansion.bottom = Math.max(expansion.bottom, blurSpread);
			}
		}
	}

	return expansion;
};

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
	const expansion = parseDropShadowExpansion(filter);
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
