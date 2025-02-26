import type {LogLevel} from '../../log';
import {Log} from '../../log';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {iteratorOverTsFiles} from './return-packets';
import type {M3uStructure} from './types';

export const runOverM3u = async ({
	state,
	structure,
	playlistUrl,
	logLevel,
}: {
	state: ParserState;
	structure: M3uStructure;
	playlistUrl: string;
	logLevel: LogLevel;
}) => {
	const existingRun = state.m3u.getM3uStreamRun(playlistUrl);

	if (existingRun) {
		Log.trace(logLevel, 'Existing M3U parsing process found for', playlistUrl);
		const run = await existingRun.continue();
		state.m3u.setM3uStreamRun(playlistUrl, run);
		if (!run) {
			state.m3u.setAllChunksProcessed();
		}

		return;
	}

	Log.trace(logLevel, 'Starting new M3U parsing process for', playlistUrl);
	return new Promise<void>((resolve, reject) => {
		const run = iteratorOverTsFiles({
			playlistUrl,
			structure,
			onInitialProgress: (newRun) => {
				state.m3u.setM3uStreamRun(playlistUrl, newRun);
				resolve();
			},
			logLevel: state.logLevel,
			onDoneWithTracks() {
				const allDone = state.m3u.setTracksDone(playlistUrl);
				if (allDone) {
					state.callbacks.tracks.setIsDone(state.logLevel);
				}
			},
			onAudioTrack: (track) => {
				// TODO: Should undergo a sample sorting process instead
				return registerAudioTrack({
					container: 'm3u8',
					state,
					track,
				});
			},
			onVideoTrack: (track) => {
				// TODO: Should undergo a sample sorting process instead
				return registerVideoTrack({
					container: 'm3u8',
					state,
					track,
				});
			},
			m3uState: state.m3u,
			parentController: state.controller,
		});

		run.catch((err) => {
			reject(err);
		});
	});
};
