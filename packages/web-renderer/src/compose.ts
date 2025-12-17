import {drawDomElement} from './drawing/draw-dom-element';
import {drawElementToCanvas} from './drawing/draw-element-to-canvas';
import {handleTextNode} from './drawing/text/handle-text-node';

export const compose = async (
	element: HTMLDivElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		(node) => {
			if (node instanceof Element) {
				// SVG does have children, but we process SVG elements in its
				// entirety
				if (node.parentElement instanceof SVGSVGElement) {
					return NodeFilter.FILTER_REJECT;
				}

				const computedStyle = getComputedStyle(node);

				return computedStyle.display === 'none'
					? NodeFilter.FILTER_REJECT
					: NodeFilter.FILTER_ACCEPT;
			}

			return NodeFilter.FILTER_ACCEPT;
		},
	);

	while (treeWalker.nextNode()) {
		const node = treeWalker.currentNode;
		if (node instanceof HTMLElement || node instanceof SVGElement) {
			await drawElementToCanvas({
				element: node,
				context,
				draw: drawDomElement(node),
			});
		} else if (node instanceof Text) {
			await handleTextNode(node, context);
		}
	}
};
