import type {TSequence} from 'remotion';

export const getParentSequencePlaybackRate = (
	sequence: TSequence,
	sequences: TSequence[],
): number => {
	if (sequence.parent === null) {
		return 1;
	}

	const parent = sequences.find(
		(candidate) => candidate.id === sequence.parent,
	);
	if (!parent) {
		throw new TypeError('Parent not found for sequence ' + sequence.id);
	}

	return (
		parent.sequencePlaybackRate *
		getParentSequencePlaybackRate(parent, sequences)
	);
};
