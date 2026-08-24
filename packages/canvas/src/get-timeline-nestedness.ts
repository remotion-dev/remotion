import type {TSequence} from 'remotion';

export const getTimelineNestedLevel = (
	sequence: TSequence,
	allSequences: TSequence[],
	depth: number,
): number => {
	if (!sequence.parent) {
		return depth;
	}

	const parentSequence = allSequences.find((s) => s.id === sequence.parent);
	if (!parentSequence) {
		throw new Error('has parentId but no parent');
	}

	const parentContributes = parentSequence.showInTimeline;
	return getTimelineNestedLevel(
		parentSequence,
		allSequences,
		parentContributes ? depth + 1 : depth,
	);
};
