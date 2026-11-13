import {parseBoxShadow} from './drawing/draw-box-shadow';
import {parseOutlineOffset, parseOutlineWidth} from './drawing/draw-outline';
import {parseFilterOutsets} from './drawing/filter-outsets';
import {makeDOMMatrix} from './drawing/make-dom-matrix';
import {skipToNextNonDescendant} from './walk-tree';

/**
 * Calculates the vertical text overflow when line-height is less than 1.
 * When line-height < 1, text ascenders/descenders can extend beyond the element's bounding box.
 * Returns the extra padding needed on top and bottom.
 */
const getTextOverflowForLineHeight = (
	computedStyle: CSSStyleDeclaration,
): {top: number; bottom: number} => {
	const {lineHeight} = computedStyle;
	const fontSize = parseFloat(computedStyle.fontSize);

	if (!fontSize || isNaN(fontSize)) {
		return {top: 0, bottom: 0};
	}

	let lineHeightValue: number;

	if (lineHeight === 'normal') {
		// 'normal' is typically around 1.2, no overflow
		return {top: 0, bottom: 0};
	}

	if (lineHeight.endsWith('px')) {
		lineHeightValue = parseFloat(lineHeight) / fontSize;
	} else {
		// Unitless value or percentage
		lineHeightValue = parseFloat(lineHeight);
		if (lineHeight.endsWith('%')) {
			lineHeightValue /= 100;
		}
	}

	if (isNaN(lineHeightValue) || lineHeightValue >= 1) {
		return {top: 0, bottom: 0};
	}

	// When line-height < 1, the line box is smaller than the font-size.
	// Text can overflow by (1 - lineHeight) * fontSize split across top and bottom.
	// We apply the full amount to each side as a conservative safety margin.
	const overflow = (1 - lineHeightValue) * fontSize;

	return {top: overflow, bottom: overflow};
};

export const getBiggestBoundingClientRect = (
	element: HTMLElement | SVGElement,
	includePaintOutsets = true,
	includeDescendantFilters = false,
	{
		onlyOwnPlane,
		experimental3DRendering,
		includeCapturePadding,
	}: {
		onlyOwnPlane: boolean | null;
		experimental3DRendering: boolean | null;
		includeCapturePadding: boolean | null;
	},
) => {
	const capturePadding =
		includeCapturePadding === null ? true : includeCapturePadding;
	const treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_ELEMENT,
	);
	let mostLeft = Infinity;
	let mostTop = Infinity;
	let mostRight = -Infinity;
	let mostBottom = -Infinity;

	while (true) {
		const computedStyle = getComputedStyle(treeWalker.currentNode as Element);
		// Existing capture margins affect texture sampling. Depth ordering can
		// request painted bounds without changing those raster surfaces.
		const hasOutline =
			includePaintOutsets &&
			(capturePadding ||
				(computedStyle.outlineStyle !== 'none' &&
					computedStyle.outlineStyle !== 'hidden'));
		const outlineWidth = hasOutline
			? parseOutlineWidth(computedStyle.outlineWidth)
			: 0;
		const outlineOffset = hasOutline
			? parseOutlineOffset(computedStyle.outlineOffset)
			: 0;
		const boundsOutlineWidth = capturePadding
			? outlineWidth
			: Math.max(0, outlineWidth + outlineOffset);
		const boundsOutlineOffset = capturePadding ? outlineOffset : 0;
		const rect = (treeWalker.currentNode as Element).getBoundingClientRect();

		// Calculate text overflow for elements with line-height < 1
		const textOverflow = includePaintOutsets
			? getTextOverflowForLineHeight(computedStyle)
			: {top: 0, bottom: 0};

		// Calculate box shadow extensions
		const shadows = includePaintOutsets
			? parseBoxShadow(computedStyle.boxShadow)
			: [];
		let shadowLeft = 0;
		let shadowRight = 0;
		let shadowTop = 0;
		let shadowBottom = 0;

		for (const shadow of shadows) {
			if (!shadow.inset) {
				const spread = experimental3DRendering
					? Math.max(0, shadow.spreadRadius || 0)
					: 0;
				shadowLeft = Math.max(
					shadowLeft,
					Math.abs(Math.min(shadow.offsetX, 0)) + shadow.blurRadius + spread,
				);
				shadowRight = Math.max(
					shadowRight,
					Math.max(shadow.offsetX, 0) + shadow.blurRadius + spread,
				);
				shadowTop = Math.max(
					shadowTop,
					Math.abs(Math.min(shadow.offsetY, 0)) + shadow.blurRadius + spread,
				);
				shadowBottom = Math.max(
					shadowBottom,
					Math.max(shadow.offsetY, 0) + shadow.blurRadius + spread,
				);
			}
		}

		const filterOutsets = {left: 0, right: 0, top: 0, bottom: 0};
		// Clip reference bounds need descendant filters independently of outline,
		// shadow and text padding. Existing layout-only callers do not opt in.
		if (includeDescendantFilters && treeWalker.currentNode !== element) {
			const ancestors: Element[] = [];
			for (
				let ancestor = treeWalker.currentNode as Element;
				ancestor !== element;
				ancestor = ancestor.parentElement!
			)
				ancestors.push(ancestor);
			let matrix = new DOMMatrix();
			for (const ancestor of ancestors.reverse()) {
				const style = getComputedStyle(ancestor);
				let local = makeDOMMatrix(
					style.transform === 'none' ? undefined : style.transform,
				);
				if (style.scale !== 'none')
					local = makeDOMMatrix(`scale(${style.scale})`).multiply(local);
				if (style.rotate !== 'none')
					local = makeDOMMatrix(`rotate(${style.rotate})`).multiply(local);
				matrix = matrix.multiply(local);
				const expansion = parseFilterOutsets(style.filter);
				const transformed = {left: 0, right: 0, top: 0, bottom: 0};
				for (const x of [-expansion.left, expansion.right]) {
					for (const y of [-expansion.top, expansion.bottom]) {
						const point = new DOMPoint(x, y, 0, 0).matrixTransform(matrix);
						transformed.left = Math.max(transformed.left, -point.x);
						transformed.right = Math.max(transformed.right, point.x);
						transformed.top = Math.max(transformed.top, -point.y);
						transformed.bottom = Math.max(transformed.bottom, point.y);
					}
				}

				filterOutsets.left += transformed.left;
				filterOutsets.right += transformed.right;
				filterOutsets.top += transformed.top;
				filterOutsets.bottom += transformed.bottom;
			}
		}

		mostLeft = Math.min(
			mostLeft,
			rect.left -
				boundsOutlineOffset -
				boundsOutlineWidth -
				shadowLeft -
				filterOutsets.left,
		);
		mostTop = Math.min(
			mostTop,
			rect.top -
				boundsOutlineOffset -
				boundsOutlineWidth -
				shadowTop -
				textOverflow.top -
				filterOutsets.top,
		);
		mostRight = Math.max(
			mostRight,
			rect.right +
				boundsOutlineOffset +
				boundsOutlineWidth +
				shadowRight +
				filterOutsets.right,
		);
		mostBottom = Math.max(
			mostBottom,
			rect.bottom +
				boundsOutlineOffset +
				boundsOutlineWidth +
				shadowBottom +
				textOverflow.bottom +
				filterOutsets.bottom,
		);

		if (onlyOwnPlane) break;
		if (computedStyle.overflow === 'hidden') {
			if (!skipToNextNonDescendant(treeWalker)) {
				break;
			}

			if (experimental3DRendering) continue;
		}

		if (!treeWalker.nextNode()) {
			break;
		}
	}

	return new DOMRect(
		mostLeft,
		mostTop,
		mostRight - mostLeft,
		mostBottom - mostTop,
	);
};
