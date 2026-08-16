import type {TSequence} from './CompositionManager.js';
import type {OverrideIdToNodePaths} from './sequence-node-path.js';
import type {SequencePropsSubscriptionKey} from './SequenceManager.js';

const isJsxElementAncestor = (
	ancestor: SequencePropsSubscriptionKey,
	descendant: SequencePropsSubscriptionKey,
): boolean => {
	if (ancestor.absolutePath !== descendant.absolutePath) {
		return false;
	}

	if (ancestor.nodePath.at(-1) !== 'openingElement') {
		return false;
	}

	const ancestorElementPath = ancestor.nodePath.slice(0, -1);
	if (descendant.nodePath.length <= ancestorElementPath.length) {
		return false;
	}

	return ancestorElementPath.every(
		(segment, index) => descendant.nodePath[index] === segment,
	);
};

export const getInteractivitySequenceFrameOffset = ({
	parentSequenceId,
	sequences,
	overrideIdsToNodePaths,
	nodePath,
}: {
	parentSequenceId: string | null;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	nodePath: SequencePropsSubscriptionKey | null;
}): number => {
	if (nodePath === null) {
		return 0;
	}

	const sequencesById = new Map(
		sequences.map((sequence) => [sequence.id, sequence]),
	);
	let currentParentId = parentSequenceId;
	let offset = 0;

	while (currentParentId !== null) {
		const parent = sequencesById.get(currentParentId);
		if (!parent) {
			break;
		}

		const overrideId = parent.controls?.overrideId ?? null;
		const parentNodePath = overrideId
			? (overrideIdsToNodePaths[overrideId] ?? null)
			: null;

		// useCurrentFrame() is evaluated when the source component renders. JSX
		// Sequences below that hook do not make the captured frame local to them.
		if (
			parentNodePath !== null &&
			isJsxElementAncestor(parentNodePath, nodePath)
		) {
			offset +=
				parent.trimBefore === null
					? parent.from
					: parent.from - parent.trimBefore;
		}

		currentParentId = parent.parent;
	}

	return offset;
};
