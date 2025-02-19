import type {TSequence} from 'remotion';
import {
	getCascadedStart,
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
import {getTimelineNestedLevel} from './get-timeline-nestedness';
import {getTimelineSequenceHash} from './get-timeline-sequence-hash';
import type {
	TrackWithHash,
	TrackWithHashAndOriginalTimings,
} from './get-timeline-sequence-sort-key';
import {getTimelineSequenceSequenceSortKey} from './get-timeline-sequence-sort-key';

export const calculateTimeline = ({
	sequences,
	sequenceDuration,
}: {
	sequences: TSequence[];
	sequenceDuration: number;
}): TrackWithHash[] => {
	const tracks: TrackWithHashAndOriginalTimings[] = [];

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
					loopDisplay: undefined,
					stack: null,
					premountDisplay: null,
				},
				depth: 0,
				hash: '-',
			},
		];
	}

	const sameHashes: {[hash: string]: string[]} = {};

	const hashesUsedInRoot: {[rootId: string]: string[]} = {};
	const cache: {[sequenceId: string]: string} = {};

	for (let i = 0; i < sequences.length; i++) {
		const sequence = sequences[i];
		if (!hashesUsedInRoot[sequence.rootId]) {
			hashesUsedInRoot[sequence.rootId] = [];
		}

		const actualHash = getTimelineSequenceHash(
			sequence,
			sequences,
			hashesUsedInRoot,
			cache,
		);

		if (!sameHashes[actualHash]) {
			sameHashes[actualHash] = [];
		}

		sameHashes[actualHash].push(sequence.id);

		const cascadedStart = getCascadedStart(sequence, sequences);

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
			cascadedStart,
			cascadedDuration: sequence.duration,
		});
	}

	const uniqueTracks: TrackWithHash[] = [];
	for (const track of tracks) {
		if (!uniqueTracks.find((t) => t.hash === track.hash)) {
			const {cascadedDuration, cascadedStart, ...cleanTrack} = track;
			uniqueTracks.push(cleanTrack);
		}
	}

	return uniqueTracks.sort((a, b) => {
		const sortKeyA = getTimelineSequenceSequenceSortKey(a, tracks, sameHashes);
		const sortKeyB = getTimelineSequenceSequenceSortKey(b, tracks, sameHashes);
		return sortKeyA.localeCompare(sortKeyB);
	});
};
