const sequenceTimingTraits = ['from', 'durationInFrames', 'trimBefore'];

export const hasSequenceTimingTraits = (sequenceKeys: readonly string[]) => {
	return sequenceTimingTraits.every((trait) => sequenceKeys.includes(trait));
};
