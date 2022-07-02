import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineViewState} from './timeline-state-reducer';

export const isTrackCollapsed = (
	hash: string,
	viewState: TimelineViewState
) => {
	return viewState.collapsed[hash] !== false;
};

export const isTrackHidden = (
	track: TrackWithHash,
	allTracks: TrackWithHash[],
	viewState: TimelineViewState
): boolean => {
	if (!track.sequence.parent) {
		return false;
	}

	const parent = allTracks.find((t) => t.sequence.id === track.sequence.parent);
	if (!parent) {
		// TODO: Tighten up, when toggling rich timeline this case can happen right now
		return false;
	}

	if (isTrackCollapsed(parent.hash, viewState)) {
		return true;
	}

	return isTrackHidden(parent, allTracks, viewState);
};
