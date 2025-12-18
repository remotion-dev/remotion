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

	while (treeWalker.nextNode()) {
		const rect = (treeWalker.currentNode as Element).getBoundingClientRect();
		mostLeft = Math.min(mostLeft, rect.left);
		mostTop = Math.min(mostTop, rect.top);
		mostRight = Math.max(mostRight, rect.right);
		mostBottom = Math.max(mostBottom, rect.bottom);
	}

	return new DOMRect(
		mostLeft,
		mostTop,
		mostRight - mostLeft,
		mostBottom - mostTop,
	);
};
