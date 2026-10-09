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

	return (
		getCascadedStart(parent, sequences) +
		(sequence.from - (parent.trimBefore ?? 0)) /
			getParentSequencePlaybackRate(sequence, sequences)
	);
};

export const getCascadedStartWithTrim = (
	sequence: TSequence,
	sequences: TSequence[],
): number => {
	return (
		getCascadedStart(sequence, sequences) -
		(sequence.trimBefore ?? 0) /
			(getParentSequencePlaybackRate(sequence, sequences) *
				sequence.sequencePlaybackRate)
	);
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
	const start = getTimelineVisibleStart(sequence, sequences);
	const end =
		getCascadedStart(sequence, sequences) +
		sequence.duration / getParentSequencePlaybackRate(sequence, sequences);
	if (!sequence.parent) {
		return Math.max(0, end - start);
	}

	const parent = sequences.find((s) => s.id === sequence.parent);
	if (!parent) {
		throw new TypeError('Parent not found for sequence ' + sequence.id);
	}

	return Math.max(
		0,
		Math.min(
			end,
			getTimelineVisibleStart(parent, sequences) +
				getTimelineVisibleDuration(parent, sequences),
		) - start,
	);
};
