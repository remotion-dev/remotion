import {TSequence} from 'remotion';
import {
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
import {getTimelineNestedLevel} from './get-timeline-nestedness';
import {getTimelineSequenceHash} from './get-timeline-sequence-hash';

export type SequenceWithOverlap = {
	sequence: TSequence;
	overlaps: TSequence[];
};

export type Track = {
	sequence: TSequence;
	depth: number;
};

export const calculateTimeline = ({
	sequences,
	sequenceDuration,
}: {
	sequences: TSequence[];
	sequenceDuration: number;
}): Track[] => {
	const tracks: Track[] = [];

	if (sequences.length === 0) {
		return [
			{
				sequence: {
					displayName: '',
					duration: sequenceDuration,
					from: 0,
					id: 'seq',
					parent: null,
					type: 'sequence',
					rootId: '-',
				},
				depth: 0,
			},
		];
	}

	const hashesUsedInRoot: {[rootId: string]: string[]} = {};
	const hashesUsed: string[] = [];
	for (let i = 0; i < sequences.length; i++) {
		const sequence = sequences[i];
		if (!hashesUsedInRoot[sequence.rootId]) {
			hashesUsedInRoot[sequence.rootId] = [];
		}
		const baseHash = getTimelineSequenceHash(sequence, sequences);
		const depth = getTimelineNestedLevel(sequence, sequences, 0);
		const visibleStart = getTimelineVisibleStart(sequence, sequences);
		const visibleDuration = getTimelineVisibleDuration(sequence, sequences);
		const actualHash =
			baseHash +
			hashesUsedInRoot[sequence.rootId].filter((h) => h === baseHash).length;

		if (hashesUsed.includes(actualHash)) {
			continue;
		}

		hashesUsedInRoot[sequence.rootId].push(baseHash);
		hashesUsed.push(actualHash);

		tracks.push({
			sequence: {
				...sequence,
				from: visibleStart,
				duration: visibleDuration,
			},
			depth,
		});
	}
	return tracks;
};
