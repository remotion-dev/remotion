import type {TSequence} from 'remotion';

export const getTimelineNestedLevel = (
	sequence: TSequence,
	allSequences: TSequence[],
	depth: number,
	mergedParentIds: ReadonlySet<string> = new Set(),
): number => {
	if (!sequence.parent) {
		return depth;
	}

	const parentSequence = allSequences.find((s) => s.id === sequence.parent);
	if (!parentSequence) {
		throw new Error('has parentId but no parent');
	}

	const parentContributes =
		parentSequence.showInTimeline && !mergedParentIds.has(parentSequence.id);
	return getTimelineNestedLevel(
		parentSequence,
		allSequences,
		parentContributes ? depth + 1 : depth,
		mergedParentIds,
	);
};
