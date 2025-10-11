import type {Options, ParseMediaFields} from '../fields';
import type {MediaParserTrack} from '../get-tracks';
import type {MediaParserLogLevel} from '../log';
import {Log} from '../log';
import type {ParseMediaSrc} from '../options';
import type {CanSkipTracksState} from './can-skip-tracks';

export const makeTracksSectionState = (
	canSkipTracksState: CanSkipTracksState,
	src: ParseMediaSrc,
) => {
	const tracks: MediaParserTrack[] = [];
	let doneWithTracks = false;

	return {
		hasAllTracks: () => doneWithTracks,
		getIsDone: () => doneWithTracks,
		setIsDone: (logLevel: MediaParserLogLevel) => {
			if (doneWithTracks) {
				throw new Error(
					'Error in Media Parser: Tracks have already been parsed',
				);
			}

			Log.verbose(logLevel, 'All tracks have been parsed');
			doneWithTracks = true;
		},
		addTrack: (track: MediaParserTrack) => {
			tracks.push(track);
		},
		getTracks: () => {
			return tracks;
		},
		ensureHasTracksAtEnd: (fields: Options<ParseMediaFields>) => {
			if (canSkipTracksState.canSkipTracks()) {
				return;
			}

			if (!fields.tracks) {
				return;
			}

			if (!doneWithTracks) {
				throw new Error(
					'Error in Media Parser: End of parsing of ' +
						src +
						' has been reached, but no tracks have been found ',
				);
			}
		},
	};
};

export type TracksState = ReturnType<typeof makeTracksSectionState>;
