import type {RefObject} from 'react';
import {Internals} from 'remotion';

/** Resolve boxless DOM roots without adding a wrapper to the composition. */
export const getCanvasOutlineNodes = (
	ref: RefObject<Element | null>,
): readonly (Element | Text)[] => {
	const automaticNodes = Internals.SequenceOutlineInternals.getNodes(ref);
	if (automaticNodes === null) {
		return ref.current === null ? [] : [ref.current];
	}

	const nodes: (Element | Text)[] = [];
	const visit = (node: Element | Text) => {
		if (!node.isConnected) {
			return;
		}

		if (
			node.nodeType === 1 &&
			node.ownerDocument.defaultView?.getComputedStyle(node as Element)
				.display === 'contents'
		) {
			for (const child of node.childNodes) {
				if (child.nodeType === 1 || child.nodeType === 3) {
					visit(child as Element | Text);
				}
			}

			return;
		}

		nodes.push(node);
	};

	for (const node of automaticNodes) {
		visit(node);
	}

	return nodes;
};
