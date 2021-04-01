import {TSequence} from 'remotion';

// The goal for this function is to calculate an as unique as possible identifier
// for a sequence based on it's properties. A sequence can be registered multiple times
// from main preview and from thumbnails and we use this to deduplicate it.
// This is why we don't use `id` properties as they will
// differ as a hash.
export const getTimelineSequenceHash = (
	sequence: TSequence,
	allSequences: TSequence[]
): string => {
	const parent = allSequences.find((a) => a.id === sequence.parent);
	return [
		sequence.displayName,
		sequence.duration,
		sequence.from,
		sequence.type,
		sequence.type === 'audio' ? sequence.src : null,
		sequence.type === 'video' ? sequence.src : null,
		parent ? getTimelineSequenceHash(parent, allSequences) : null,
	].join('-');
};
