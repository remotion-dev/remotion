import type {CanSkipTracksState} from './can-skip-tracks';

export const makeTracksSectionState = (
	canSkipTracksState: CanSkipTracksState,
) => {
	let doneWithTracks = false;

	return {
		hasAllTracks: () => doneWithTracks,
		setIsDone: () => {
			doneWithTracks = true;
		},
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
