import type {LogLevel} from 'remotion';
import {drawDomElement} from './drawing/draw-dom-element';
import type {DrawElementToCanvasReturnValue} from './drawing/draw-element-to-canvas';
import {drawElementToCanvas} from './drawing/draw-element-to-canvas';
import {handleTextNode} from './drawing/text/handle-text-node';
import {skipToNextNonDescendant} from './walk-tree';

const walkOverNode = ({
	node,
	context,
	offsetLeft,
	offsetTop,
	logLevel,
	parentRect,
}: {
	node: Node;
	context: OffscreenCanvasRenderingContext2D;
	offsetLeft: number;
	offsetTop: number;
	logLevel: LogLevel;
	parentRect: DOMRect;
}): Promise<DrawElementToCanvasReturnValue> => {
	if (node instanceof HTMLElement || node instanceof SVGElement) {
		return drawElementToCanvas({
			element: node,
			context,
			draw: drawDomElement(node),
			offsetLeft,
			offsetTop,
			logLevel,
			parentRect,
		});
	}

	if (node instanceof Text) {
		return handleTextNode({
			node,
			context,
			offsetLeft,
			offsetTop,
			logLevel,
			parentRect,
		});
	}

	throw new Error('Unknown node type');
};

export const compose = async ({
	element,
	context,
	offsetLeft,
	offsetTop,
	logLevel,
	parentRect,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	offsetLeft: number;
	offsetTop: number;
	logLevel: LogLevel;
	parentRect: DOMRect;
}) => {
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

	while (true) {
		const val = await walkOverNode({
			node: treeWalker.currentNode,
			context,
			offsetLeft,
			offsetTop,
			logLevel,
			parentRect,
		});
		if (val === 'skip-children') {
			if (!skipToNextNonDescendant(treeWalker)) {
				break;
			}
		} else if (!treeWalker.nextNode()) {
			break;
		}
	}
};
