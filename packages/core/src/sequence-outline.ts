import type {RefObject} from 'react';
import React from 'react';

type OutlineNode = Element | Text;
type OutlineRef = RefObject<Element | null>;

export const SequenceOutlineContext = React.createContext(false);

// Keep automatic groups separate from the public, single-element outlineRef.
// A group only exposes .current when it has exactly one element, so consumers
// that require an actual element never accidentally act on part of a group.
const nodesByRef = new WeakMap<OutlineRef, readonly OutlineNode[]>();

export const SequenceOutlineInternals = {
	createRef: (): OutlineRef => {
		const ref: OutlineRef = {current: null};
		nodesByRef.set(ref, []);
		return ref;
	},
	getNodes: (ref: OutlineRef): readonly OutlineNode[] | null => {
		return nodesByRef.get(ref) ?? null;
	},
	setNodes: (ref: OutlineRef, nodes: readonly OutlineNode[]) => {
		const previous = nodesByRef.get(ref);
		if (
			previous?.length === nodes.length &&
			previous.every((node, index) => node === nodes[index])
		) {
			return;
		}

		nodesByRef.set(ref, nodes);
		ref.current =
			nodes.length === 1 && nodes[0].nodeType === 1
				? (nodes[0] as Element)
				: null;
	},
};
