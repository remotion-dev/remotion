import {parseBoxShadow} from './drawing/draw-box-shadow';
import {parseOutlineOffset, parseOutlineWidth} from './drawing/draw-outline';
import {skipToNextNonDescendant} from './walk-tree';

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
			rect.top - outlineOffset - outlineWidth - shadowTop,
		);
		mostRight = Math.max(
			mostRight,
			rect.right + outlineOffset + outlineWidth + shadowRight,
		);
		mostBottom = Math.max(
			mostBottom,
			rect.bottom + outlineOffset + outlineWidth + shadowBottom,
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
