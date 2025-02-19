import type {Track} from '../get-tracks';
import type {LogLevel} from '../log';
import {Log} from '../log';
import type {Options, ParseMediaFields} from '../options';
import type {CanSkipTracksState} from './can-skip-tracks';

export const makeTracksSectionState = (
	canSkipTracksState: CanSkipTracksState,
) => {
	const tracks: Track[] = [];
	let doneWithTracks = false;

	return {
		hasAllTracks: () => doneWithTracks,
		getIsDone: () => doneWithTracks,
		setIsDone: (logLevel: LogLevel) => {
			if (doneWithTracks) {
				throw new Error(
					'Error in Media Parser: Tracks have already been parsed',
				);
			}

			Log.verbose(logLevel, 'All tracks have been parsed');
			doneWithTracks = true;
		},
		addTrack: (track: Track) => {
			tracks.push(track);
		},
		getTracks: () => tracks,
		ensureHasTracksAtEnd: (fields: Options<ParseMediaFields>) => {
			if (canSkipTracksState.canSkipTracks()) {
				return;
			}

			if (!fields.tracks) {
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
