import {TSequence} from 'remotion';

export type Track = {
	sequence: TSequence;
	depth: number;
};

export type TrackWithHash = Track & {
	hash: string;
};

export const getTimelineSequenceSequenceSortKey = (
	track: TrackWithHash,
	tracks: TrackWithHash[],
	sameHashes: {[hash: string]: string[]} = {}
): string => {
	const id = String(track.sequence.nonce).padStart(6, '0');
	const firstParentWithSameHash = tracks.find((a) => {
		return sameHashes[track.hash].includes(a.sequence.parent as string);
	});
	if (!firstParentWithSameHash) {
		return id;
	}
	return `${getTimelineSequenceSequenceSortKey(
		firstParentWithSameHash,
		tracks,
		sameHashes
	)}-${id}`;
};
