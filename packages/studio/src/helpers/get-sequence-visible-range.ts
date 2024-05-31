import type {TSequence} from 'remotion';

export const getCascadedStart = (
	sequence: TSequence,
	sequences: TSequence[],
): number => {
	if (!sequence.parent) {
		return sequence.from;
	}

	const parent = sequences.find((s) => s.id === sequence.parent);
	if (!parent) {
		throw new TypeError('Parent not found for sequence ' + sequence.id);
	}

	return getCascadedStart(parent, sequences) + sequence.from;
};

export const getTimelineVisibleStart = (
	sequence: TSequence,
	sequences: TSequence[],
): number => {
	const cascadedStart = Math.max(0, getCascadedStart(sequence, sequences));
	if (!sequence.parent) {
		return cascadedStart;
	}

	const parent = sequences.find((s) => s.id === sequence.parent);
	if (!parent) {
		throw new TypeError('Parent not found for sequence ' + sequence.id);
	}

	const timelineVisibleStart = getTimelineVisibleStart(parent, sequences);
	return Math.max(timelineVisibleStart, cascadedStart);
};

export const getTimelineVisibleDuration = (
	sequence: TSequence,
	sequences: TSequence[],
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
		getTimelineVisibleDuration(parent, sequences),
	);
};
