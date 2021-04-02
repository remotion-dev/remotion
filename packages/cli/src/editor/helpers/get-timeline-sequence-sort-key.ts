import {TSequence} from 'remotion';

export const getTimelineSequenceSequenceSortKey = (
	sequence: TSequence,
	allSequences: TSequence[]
): string => {
	const id = String(sequence.nonce).padStart(6, '0');
	const parent = allSequences.find((a) => a.id === sequence.parent);
	if (!parent) {
		return id;
	}
	return `${getTimelineSequenceSequenceSortKey(parent, allSequences)}-${id}`;
};
