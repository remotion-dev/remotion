import {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineViewState} from './timeline-state-reducer';

export const isCollapsed = (
	track: TrackWithHash,
	allTracks: TrackWithHash[],
	viewState: TimelineViewState
): boolean => {
	if (!track.sequence.parent) {
		return false;
	}
	const parent = allTracks.find((t) => t.sequence.id === track.sequence.parent);
	if (!parent) {
		throw new Error('did not find parent');
	}
	if (viewState.collapsed[parent.hash]) {
		return true;
	}
	return isCollapsed(parent, allTracks, viewState);
};
