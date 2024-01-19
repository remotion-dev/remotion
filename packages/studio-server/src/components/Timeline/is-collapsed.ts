import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';

export const isTrackHidden = (
	track: TrackWithHash,
	allTracks: TrackWithHash[],
): boolean => {
	if (!track.sequence.parent) {
		return false;
	}

	const parent = allTracks.find(
		(t) => t.sequence.id === track.sequence.parent,
	) as TrackWithHash;

	// Due to effects and conditional `showInTimeline`, a parent
	// may not exist in the `allTracks` array.
	if (!parent) {
		return true;
	}

	return isTrackHidden(parent, allTracks);
};
