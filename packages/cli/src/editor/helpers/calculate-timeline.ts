import {TSequence} from 'remotion';
import {
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
import {getTimelineNestedLevel} from './get-timeline-nestedness';
import {getTimelineSequenceHash} from './get-timeline-sequence-hash';
import {
	getTimelineSequenceSequenceSortKey,
	Track,
	TrackWithHash,
} from './get-timeline-sequence-sort-key';

export type SequenceWithOverlap = {
	sequence: TSequence;
	overlaps: TSequence[];
};

export const calculateTimeline = ({
	sequences,
	sequenceDuration,
}: {
	sequences: TSequence[];
	sequenceDuration: number;
}): Track[] => {
	const tracks: TrackWithHash[] = [];

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
					showInTimeline: true,
					nonce: 0,
				},
				depth: 0,
			},
		];
	}

	const sameHashes: {[hash: string]: string[]} = {};

	const hashesUsedInRoot: {[rootId: string]: string[]} = {};
	for (let i = 0; i < sequences.length; i++) {
		const sequence = sequences[i];
		if (!hashesUsedInRoot[sequence.rootId]) {
			hashesUsedInRoot[sequence.rootId] = [];
		}
		if (!sequence.showInTimeline) {
			continue;
		}

		const baseHash = getTimelineSequenceHash(sequence, sequences);
		const actualHash =
			baseHash +
			hashesUsedInRoot[sequence.rootId].filter((h) => h === baseHash).length;

		if (!sameHashes[actualHash]) {
			sameHashes[actualHash] = [];
		}
		sameHashes[actualHash].push(sequence.id);
		hashesUsedInRoot[sequence.rootId].push(baseHash);

		const visibleStart = getTimelineVisibleStart(sequence, sequences);
		const visibleDuration = getTimelineVisibleDuration(sequence, sequences);

		tracks.push({
			sequence: {
				...sequence,
				from: visibleStart,
				duration: visibleDuration,
			},
			depth: getTimelineNestedLevel(sequence, sequences, 0),
			hash: actualHash,
		});
	}

	const uniqueTracks: TrackWithHash[] = [];
	for (const track of tracks) {
		if (!uniqueTracks.find((t) => t.hash === track.hash)) {
			uniqueTracks.push(track);
		}
	}

	return uniqueTracks.sort((a, b) => {
		const sortKeyA = getTimelineSequenceSequenceSortKey(a, tracks, sameHashes);
		const sortKeyB = getTimelineSequenceSequenceSortKey(b, tracks, sameHashes);
		if (sortKeyA.startsWith(sortKeyB)) {
			return -1;
		}
		return sortKeyA.localeCompare(sortKeyB);
	});
};
