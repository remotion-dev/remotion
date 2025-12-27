import type {LogLevel} from 'remotion';
import {drawDomElement} from './drawing/draw-dom-element';
import type {ProcessNodeReturnValue} from './drawing/process-node';
import {processNode} from './drawing/process-node';
import {handleTextNode} from './drawing/text/handle-text-node';
import type {InternalState} from './internal-state';
import {skipToNextNonDescendant} from './walk-tree';

const walkOverNode = ({
	node,
	context,
	offsetLeft,
	offsetTop,
	logLevel,
	parentRect,
	internalState,
}: {
	node: Node;
	context: OffscreenCanvasRenderingContext2D;
	offsetLeft: number;
	offsetTop: number;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
}): Promise<ProcessNodeReturnValue> => {
	if (node instanceof HTMLElement || node instanceof SVGElement) {
		return processNode({
			element: node,
			context,
			draw: drawDomElement(node),
			offsetLeft,
			offsetTop,
			logLevel,
			parentRect,
			internalState,
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
			internalState,
		});
	}

	throw new Error('Unknown node type');
};

type CleanupAfterChildrenFn = {
	element: Node;
	cleanupFn: () => void;
};

export const compose = async ({
	element,
	context,
	offsetLeft,
	offsetTop,
	logLevel,
	parentRect,
	internalState,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	offsetLeft: number;
	offsetTop: number;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
}) => {
	const cleanupAfterChildren: CleanupAfterChildrenFn[] = [];

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
		for (let i = 0; i < cleanupAfterChildren.length; ) {
			const cleanup = cleanupAfterChildren[i];
			if (
				!(
					cleanup.element === treeWalker.currentNode ||
					cleanup.element.contains(treeWalker.currentNode)
				)
			) {
				cleanup.cleanupFn();
				cleanupAfterChildren.splice(i, 1);
			} else {
				i++;
			}
		}

		const val = await walkOverNode({
			node: treeWalker.currentNode,
			context,
			offsetLeft,
			offsetTop,
			logLevel,
			parentRect,
			internalState,
		});
		if (val.type === 'skip-children') {
			if (!skipToNextNonDescendant(treeWalker)) {
				break;
			}
		} else {
			cleanupAfterChildren.push({
				element: treeWalker.currentNode,
				cleanupFn: val.cleanupAfterChildren,
			});

			if (!treeWalker.nextNode()) {
				break;
			}
		}
	}

	for (const cleanup of cleanupAfterChildren) {
		cleanup.cleanupFn();
	}
};
