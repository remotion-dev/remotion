import type {Track} from '../get-tracks';
import type {CanSkipTracksState} from './can-skip-tracks';

export const makeTracksSectionState = (
	canSkipTracksState: CanSkipTracksState,
) => {
	const tracks: Track[] = [];
	let doneWithTracks = false;

	return {
		hasAllTracks: () => doneWithTracks,
		setIsDone: () => {
			doneWithTracks = true;
		},
		addTrack: (track: Track) => {
			tracks.push(track);
		},
		getTracks: () => tracks,
		ensureHasTracksAtEnd: () => {
			if (canSkipTracksState.canSkipTracks()) {
				return;
			}

			if (!doneWithTracks) {
				throw new Error(
					'Error in Media Parser: End of parsing has been reached, but no tracks have been found',
				);
			}
		},
	};
};

export type TracksState = ReturnType<typeof makeTracksSectionState>;
