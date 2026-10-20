import type {TSequence} from 'remotion';

// Returns the full child end in the wrapper's parent clock, independently of
// its current trim. Resizing and the available-content outline share this end.
export const getTimelineSequenceNaturalDuration = ({
	sequence,
	sequences,
}: {
	readonly sequence: TSequence;
	readonly sequences: readonly TSequence[];
}): number | null => {
	if (!sequence.canInferDuration) {
		return null;
	}

	let ancestor: TSequence | undefined = sequence;
	while (ancestor) {
		if (ancestor.loopDisplay || ancestor.frozenFrame !== null) {
			return null;
		}

		const parentId: string | null = ancestor.parent;
		ancestor = sequences.find((candidate) => candidate.id === parentId);
	}

	const children = sequences.filter((child) => child.parent === sequence.id);
	if (
		children.length === 0 ||
		children.some(
			(child) =>
				child.unclippedDuration === null ||
				child.unclippedDuration === undefined,
		)
	) {
		return null;
	}

	const duration = Math.max(
		...children.map(
			(child) =>
				(child.from -
					(sequence.trimBefore ?? 0) +
					(child.unclippedDuration ?? 0)) /
				sequence.sequencePlaybackRate,
		),
	);

	return Number.isFinite(duration) ? duration : null;
};
