import type {Composable} from './composable';

export const findCapturableElements = (element: HTMLDivElement) => {
	const treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		(node) => {
			if (node instanceof Element) {
				const computedStyle = getComputedStyle(node);
				return computedStyle.display === 'none'
					? NodeFilter.FILTER_REJECT
					: NodeFilter.FILTER_ACCEPT;
			}

			return NodeFilter.FILTER_ACCEPT;
		},
	);

	const composables: Composable[] = [];

	while (treeWalker.nextNode()) {
		const node = treeWalker.currentNode;

		if (
			node instanceof HTMLCanvasElement ||
			node instanceof SVGSVGElement ||
			node instanceof HTMLImageElement
		) {
			composables.push({
				type: 'element',
				element: node,
			});
		}
	}

	return composables;
};
