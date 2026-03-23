import type {TSequence} from 'remotion';

type Track = {
	sequence: TSequence;
	depth: number;
};

export type TrackWithHash = Track & {
	hash: string;
};

export type TrackWithHashAndOriginalTimings = TrackWithHash & {
	hash: string;
	cascadedStart: number;
	cascadedDuration: number;
};

export const getTimelineSequenceSequenceSortKey = (
	track: TrackWithHash,
	tracks: TrackWithHash[],
	sameHashes: {[hash: string]: string[]} = {},
	nonceRanks: Map<string, number> = new Map(),
): string => {
	const firstSequenceWithSameHash = tracks.find((t) =>
		sameHashes[track.hash].includes(t.sequence.id),
	);
	const sequenceId = (firstSequenceWithSameHash as TrackWithHash).sequence.id;
	const rank = nonceRanks.get(sequenceId) ?? 0;
	const id = String(rank).padStart(6, '0');
	if (!track.sequence.parent) {
		return id;
	}

	const parent = tracks.find((t) => t.sequence.id === track.sequence.parent);
	if (!parent) {
		// Due to effects and conditional `showInTimeline`, a parent
		// may not exist in the `allTracks` array.
		return id;
	}

	const firstParentWithSameHash = tracks.find((a) => {
		return sameHashes[parent.hash].includes(a.sequence.id as string);
	});
	if (!firstParentWithSameHash) {
		throw new Error('could not find parent: ' + track.sequence.parent);
	}

	return `${getTimelineSequenceSequenceSortKey(
		firstParentWithSameHash,
		tracks,
		sameHashes,
		nonceRanks,
	)}-${id}`;
};
