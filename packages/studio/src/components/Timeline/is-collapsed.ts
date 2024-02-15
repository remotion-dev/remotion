import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';

export const isTrackHidden = (track: TrackWithHash): boolean => {
	if (!track.sequence.parent) {
		return false;
	}

	return !track.sequence.showInTimeline;
};
