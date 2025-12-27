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
		mostLeft = Math.min(mostLeft, rect.left - outlineOffset - outlineWidth);
		mostTop = Math.min(mostTop, rect.top - outlineOffset - outlineWidth);
		mostRight = Math.max(mostRight, rect.right + outlineOffset + outlineWidth);
		mostBottom = Math.max(
			mostBottom,
			rect.bottom + outlineOffset + outlineWidth,
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
