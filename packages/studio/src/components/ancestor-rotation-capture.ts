import type {SelectedOutline} from './selected-outline-geometry';
import type {SelectedOutlineRotationDragTarget} from './selected-outline-types';

export type AncestorRotationCapture = {
	readonly key: string;
	readonly outline: SelectedOutline;
	readonly rotationDrag: SelectedOutlineRotationDragTarget;
};

export type AncestorRotationNode = {
	readonly key: string;
	readonly sequenceId: string | null;
	readonly parentSequenceId: string | null;
	readonly selectedForRotation: boolean;
};

/** The nearest ancestor whose canvas drag should rotate, skipping the outline itself. */
export const findAncestorRotationKey = ({
	key,
	nodes,
	parentBySequenceId,
}: {
	readonly key: string;
	readonly nodes: readonly AncestorRotationNode[];
	readonly parentBySequenceId: ReadonlyMap<string, string | null>;
}): string | null => {
	const nodeByKey = new Map(nodes.map((node) => [node.key, node]));
	const nodeBySequenceId = new Map<string, AncestorRotationNode>();
	for (const node of nodes) {
		if (node.sequenceId !== null) {
			nodeBySequenceId.set(node.sequenceId, node);
		}
	}

	const start = nodeByKey.get(key);
	if (start === undefined) {
		return null;
	}

	let parentId = start.parentSequenceId;
	const seen = new Set<string>();
	while (parentId !== null && !seen.has(parentId)) {
		seen.add(parentId);
		const ancestor = nodeBySequenceId.get(parentId);
		if (ancestor?.selectedForRotation) {
			return ancestor.key;
		}

		parentId =
			ancestor?.parentSequenceId ?? parentBySequenceId.get(parentId) ?? null;
	}

	return null;
};

/**
 * A plain drag on a descendant rotates the ancestor. Shift and toggle keep
 * selection, and the command key keeps the temporary translate gesture.
 */
export const shouldDelegateOutlinePointerToAncestorRotation = ({
	shiftKey,
	toggleKey,
	commandKey,
}: {
	readonly shiftKey: boolean;
	readonly toggleKey: boolean;
	readonly commandKey: boolean;
}): boolean => {
	return !shiftKey && !toggleKey && !commandKey;
};
