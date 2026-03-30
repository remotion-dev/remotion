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
import {sortItemsByNonceHistory} from './sort-by-nonce-history';

export const calculateTimeline = ({
	sequences,
}: {
	sequences: TSequence[];
}): TrackWithHash[] => {
	const sortedSequences = sortItemsByNonceHistory(sequences);
	const tracks: TrackWithHashAndOriginalTimings[] = [];

	if (sortedSequences.length === 0) {
		return [];
	}

	const sameHashes: {[hash: string]: string[]} = {};

	const hashesUsedInRoot: {[rootId: string]: string[]} = {};
	const cache: {[sequenceId: string]: string} = {};

	for (let i = 0; i < sortedSequences.length; i++) {
		const sequence = sortedSequences[i];
		if (!hashesUsedInRoot[sequence.rootId]) {
			hashesUsedInRoot[sequence.rootId] = [];
		}

		const actualHash = getTimelineSequenceHash(
			sequence,
			sortedSequences,
			hashesUsedInRoot,
			cache,
		);

		if (!sameHashes[actualHash]) {
			sameHashes[actualHash] = [];
		}

		sameHashes[actualHash].push(sequence.id);

		const cascadedStart = getCascadedStart(sequence, sortedSequences);

		const visibleStart = getTimelineVisibleStart(sequence, sortedSequences);
		const visibleDuration = getTimelineVisibleDuration(
			sequence,
			sortedSequences,
		);

		tracks.push({
			sequence: {
				...sequence,
				from: visibleStart,
				duration: visibleDuration,
			},
			depth: getTimelineNestedLevel(sequence, sortedSequences, 0),
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

	const nonceRanks = new Map<string, number>();
	for (let i = 0; i < tracks.length; i++) {
		nonceRanks.set(tracks[i].sequence.id, i);
	}

	return uniqueTracks.sort((a, b) => {
		const sortKeyA = getTimelineSequenceSequenceSortKey(
			a,
			tracks,
			sameHashes,
			nonceRanks,
		);
		const sortKeyB = getTimelineSequenceSequenceSortKey(
			b,
			tracks,
			sameHashes,
			nonceRanks,
		);
		return sortKeyA.localeCompare(sortKeyB);
	});
};
