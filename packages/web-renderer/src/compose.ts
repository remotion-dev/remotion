import type {LogLevel} from 'remotion';
import {drawDomElement} from './drawing/draw-dom-element';
import type {ProcessNodeReturnValue} from './drawing/process-node';
import {processNode} from './drawing/process-node';
import {handleTextNode} from './drawing/text/handle-text-node';
import type {InternalState} from './internal-state';
import {createTreeWalkerCleanupAfterChildren} from './tree-walker-cleanup-after-children';
import {skipToNextNonDescendant} from './walk-tree';

const walkOverNode = ({
	node,
	context,
	logLevel,
	parentRect,
	internalState,
	rootElement,
	onlyBackgroundClip,
}: {
	node: Node;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	rootElement: HTMLElement | SVGElement;
	onlyBackgroundClip: boolean;
}): Promise<ProcessNodeReturnValue> => {
	if (node instanceof HTMLElement || node instanceof SVGElement) {
		return processNode({
			element: node,
			context,
			draw: drawDomElement(node),
			logLevel,
			parentRect,
			internalState,
			rootElement,
		});
	}

	if (node instanceof Text) {
		return handleTextNode({
			node,
			context,
			logLevel,
			parentRect,
			internalState,
			rootElement,
			onlyBackgroundClip,
		});
	}

	throw new Error('Unknown node type');
};

const getFilterFunction = (node: Node) => {
	if (!(node instanceof Element)) {
		// Must be a text node!
		return NodeFilter.FILTER_ACCEPT;
	}

	// SVG does have children, but we process SVG elements in its
	// entirety
	if (node.parentElement instanceof SVGSVGElement) {
		return NodeFilter.FILTER_REJECT;
	}

	const computedStyle = getComputedStyle(node);

	if (computedStyle.display === 'none') {
		return NodeFilter.FILTER_REJECT;
	}

	return NodeFilter.FILTER_ACCEPT;
};

export const compose = async ({
	element,
	context,
	logLevel,
	parentRect,
	internalState,
	onlyBackgroundClip,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	onlyBackgroundClip: boolean;
}) => {
	const treeWalker = document.createTreeWalker(
		element,
		onlyBackgroundClip
			? NodeFilter.SHOW_TEXT
			: NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		getFilterFunction,
	);

	// Skip to the first text node
	if (onlyBackgroundClip) {
		treeWalker.nextNode();
		if (!treeWalker.currentNode) {
			return;
		}
	}

	const {
		checkCleanUpAtBeginningOfIteration,
		addCleanup,
		cleanupInTheEndOfTheIteration,
	} = createTreeWalkerCleanupAfterChildren(treeWalker);

	while (true) {
		checkCleanUpAtBeginningOfIteration();

		const val = await walkOverNode({
			node: treeWalker.currentNode,
			context,
			logLevel,
			parentRect,
			internalState,
			rootElement: element,
			onlyBackgroundClip,
		});
		if (val.type === 'skip-children') {
			if (!skipToNextNonDescendant(treeWalker)) {
				break;
			}
		} else {
			if (val.cleanupAfterChildren) {
				addCleanup(treeWalker.currentNode, val.cleanupAfterChildren);
			}

			if (!treeWalker.nextNode()) {
				break;
			}
		}
	}

	cleanupInTheEndOfTheIteration();
};
