import {drawElementToCanvas} from './drawing/draw-element-to-canvas';
import {drawTextToCanvas} from './drawing/text/draw-text';

export const compose = async (
	element: HTMLDivElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
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

	const drawnTextElements: HTMLElement[] = [];

	while (treeWalker.nextNode()) {
		const node = treeWalker.currentNode;
		if (node instanceof HTMLElement || node instanceof SVGElement) {
			await drawElementToCanvas({element: node, context});
		} else if (node instanceof Text) {
			if (drawnTextElements.includes(node.parentElement as HTMLElement)) {
				continue;
			}

			await drawTextToCanvas(node.parentElement as HTMLElement, context);
			drawnTextElements.push(node.parentElement as HTMLElement);
		}
	}
};
