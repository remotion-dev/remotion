import {TSequence} from 'remotion';

export const getTimelineVisibleStart = (
	sequence: TSequence,
	sequences: TSequence[]
): number => {
	const start = Math.max(0, sequence.from);
	if (!sequence.parent) {
		return start;
	}
	const parent = sequences.find((s) => s.id === sequence.parent);
	if (!parent) {
		throw new TypeError('Parent not found for sequence ' + sequence.id);
	}
	return getTimelineVisibleStart(parent, sequences) + Math.max(0, start);
};

export const getTimelineVisibleDuration = (
	sequence: TSequence,
	sequences: TSequence[]
): number => {
	const visibleDuration = sequence.duration + Math.min(sequence.from, 0);
	if (!sequence.parent) {
		return visibleDuration;
	}
	const parent = sequences.find((s) => s.id === sequence.parent);
	if (!parent) {
		throw new TypeError('Parent not found for sequence ' + sequence.id);
	}
	return Math.min(
		visibleDuration,
		getTimelineVisibleDuration(parent, sequences)
	);
};
