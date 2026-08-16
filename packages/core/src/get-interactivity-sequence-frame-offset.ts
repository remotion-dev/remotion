import type {TSequence} from './CompositionManager.js';
import type {OverrideIdToNodePaths} from './sequence-node-path.js';
import type {SequencePropsSubscriptionKey} from './SequenceManager.js';

const nodePathsEqual = (
	first: SequencePropsSubscriptionKey['nodePath'],
	second: SequencePropsSubscriptionKey['nodePath'],
) =>
	first.length === second.length &&
	first.every((segment, index) => segment === second[index]);

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

	const frameSourceAncestorNodePaths =
		nodePath.frameSourceAncestorNodePaths ?? [];

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

		if (
			parentNodePath !== null &&
			parentNodePath.absolutePath === nodePath.absolutePath &&
			frameSourceAncestorNodePaths.some((ancestorNodePath) =>
				nodePathsEqual(parentNodePath.nodePath, ancestorNodePath),
			)
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
