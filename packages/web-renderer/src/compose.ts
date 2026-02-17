import type {LogLevel} from 'remotion';
import type {InternalState} from './internal-state';
import {createTreeWalkerCleanupAfterChildren} from './tree-walker-cleanup-after-children';
import {walkOverNode} from './walk-over-node';
import {skipToNextNonDescendant} from './walk-tree';

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
	onlyBackgroundClipText,
	scale,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	onlyBackgroundClipText: boolean;
	scale: number;
}) => {
	const treeWalker = document.createTreeWalker(
		element,
		onlyBackgroundClipText
			? NodeFilter.SHOW_TEXT
			: NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		getFilterFunction,
	);

	// Skip to the first text node
	if (onlyBackgroundClipText) {
		treeWalker.nextNode();
		if (!treeWalker.currentNode) {
			return;
		}
	}

	using treeWalkerClean = createTreeWalkerCleanupAfterChildren(treeWalker);
	const {checkCleanUpAtBeginningOfIteration, addCleanup} = treeWalkerClean;

	while (true) {
		checkCleanUpAtBeginningOfIteration();

		const val = await walkOverNode({
			node: treeWalker.currentNode,
			context,
			logLevel,
			parentRect,
			internalState,
			rootElement: element,
			onlyBackgroundClipText,
			scale,
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
};
