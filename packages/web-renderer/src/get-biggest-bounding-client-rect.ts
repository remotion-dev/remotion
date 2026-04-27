import {parseBoxShadow} from './drawing/draw-box-shadow';
import {parseOutlineOffset, parseOutlineWidth} from './drawing/draw-outline';
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
	// Text can overflow by approximately (1 - lineHeight) * fontSize total,
	// split between top and bottom.
	const overflow = (1 - lineHeightValue) * fontSize;

	return {top: overflow, bottom: overflow};
};

export const getBiggestBoundingClientRect = (
	element: HTMLElement | SVGElement,
) => {
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
		const outlineWidth = parseOutlineWidth(computedStyle.outlineWidth);
		const outlineOffset = parseOutlineOffset(computedStyle.outlineOffset);
		const rect = (treeWalker.currentNode as Element).getBoundingClientRect();

		// Calculate text overflow for elements with line-height < 1
		const textOverflow = getTextOverflowForLineHeight(computedStyle);

		// Calculate box shadow extensions
		const shadows = parseBoxShadow(computedStyle.boxShadow);
		let shadowLeft = 0;
		let shadowRight = 0;
		let shadowTop = 0;
		let shadowBottom = 0;

		for (const shadow of shadows) {
			if (!shadow.inset) {
				shadowLeft = Math.max(
					shadowLeft,
					Math.abs(Math.min(shadow.offsetX, 0)) + shadow.blurRadius,
				);
				shadowRight = Math.max(
					shadowRight,
					Math.max(shadow.offsetX, 0) + shadow.blurRadius,
				);
				shadowTop = Math.max(
					shadowTop,
					Math.abs(Math.min(shadow.offsetY, 0)) + shadow.blurRadius,
				);
				shadowBottom = Math.max(
					shadowBottom,
					Math.max(shadow.offsetY, 0) + shadow.blurRadius,
				);
			}
		}

		mostLeft = Math.min(
			mostLeft,
			rect.left - outlineOffset - outlineWidth - shadowLeft,
		);
		mostTop = Math.min(
			mostTop,
			rect.top - outlineOffset - outlineWidth - shadowTop - textOverflow.top,
		);
		mostRight = Math.max(
			mostRight,
			rect.right + outlineOffset + outlineWidth + shadowRight,
		);
		mostBottom = Math.max(
			mostBottom,
			rect.bottom +
				outlineOffset +
				outlineWidth +
				shadowBottom +
				textOverflow.bottom,
		);

		if (computedStyle.overflow === 'hidden') {
			if (!skipToNextNonDescendant(treeWalker)) {
				break;
			}
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
