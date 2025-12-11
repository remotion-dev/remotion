import type {Composable} from './composable';

export const findCapturableElements = (element: HTMLDivElement) => {
	const treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		(node) => {
			if (node instanceof Element) {
				return getComputedStyle(node).display === 'none'
					? NodeFilter.FILTER_REJECT
					: NodeFilter.FILTER_ACCEPT;
			}

			return NodeFilter.FILTER_ACCEPT;
		},
	);

	const composables: Composable[] = [];

	while (treeWalker.nextNode()) {
		const node = treeWalker.currentNode;

		if (node instanceof HTMLCanvasElement) {
			composables.push({
				type: 'canvas',
				element: node,
			});
		}

		if (node instanceof SVGSVGElement) {
			composables.push({
				type: 'svg',
				element: node,
			});
		}

		if (node instanceof HTMLImageElement) {
			composables.push({
				type: 'img',
				element: node,
			});
		}
	}

	return composables;
};
