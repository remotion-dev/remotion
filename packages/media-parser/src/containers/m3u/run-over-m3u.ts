import type {LogLevel} from '../../log';
import {Log} from '../../log';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {getWorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {iteratorOverSegmentFiles} from './iterate-over-segment-files';
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
	const tracksDone = state.m3u.getTrackDone(playlistUrl);
	const hasAudioStreamToConsider =
		state.m3u.sampleSorter.hasAudioStreamToConsider(playlistUrl);
	const hasVideoStreamToConsider =
		state.m3u.sampleSorter.hasVideoStreamToConsider(playlistUrl);

	const audioDone = !hasAudioStreamToConsider && tracksDone;
	const videoDone = !hasVideoStreamToConsider && tracksDone;

	const bothDone = audioDone && videoDone;
	if (bothDone) {
		state.m3u.setAllChunksProcessed(playlistUrl);
		return;
	}

	const existingRun = state.m3u.getM3uStreamRun(playlistUrl);

	if (existingRun) {
		Log.trace(logLevel, 'Existing M3U parsing process found for', playlistUrl);
		const run = await existingRun.continue();
		state.m3u.setM3uStreamRun(playlistUrl, run);
		if (!run) {
			state.m3u.setAllChunksProcessed(playlistUrl);
		}

		return;
	}

	Log.trace(logLevel, 'Starting new M3U parsing process for', playlistUrl);
	return new Promise<void>((resolve, reject) => {
		const run = iteratorOverSegmentFiles({
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
			onAudioTrack: audioDone
				? null
				: async (track) => {
						const existingTracks = state.callbacks.tracks.getTracks();
						let {trackId} = track;
						while (existingTracks.find((t) => t.trackId === trackId)) {
							trackId++;
						}

						const onAudioSample = await registerAudioTrack({
							container: 'm3u8',
							workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
							track: {
								...track,
								trackId,
							},
							registerAudioSampleCallback:
								state.callbacks.registerAudioSampleCallback,
							tracks: state.callbacks.tracks,
							logLevel: state.logLevel,
							onAudioTrack: state.onAudioTrack,
						});
						state.m3u.sampleSorter.addToStreamWithTrack(playlistUrl);

						if (onAudioSample === null) {
							return null;
						}

						state.m3u.sampleSorter.addAudioStreamToConsider(
							playlistUrl,
							onAudioSample,
						);

						return async (sample) => {
							await state.m3u.sampleSorter.addAudioSample(playlistUrl, sample);
						};
					},
			onVideoTrack: videoDone
				? null
				: async (track) => {
						const existingTracks = state.callbacks.tracks.getTracks();
						let {trackId} = track;
						while (existingTracks.find((t) => t.trackId === trackId)) {
							trackId++;
						}

						const onVideoSample = await registerVideoTrack({
							container: 'm3u8',
							workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
							track: {
								...track,
								trackId,
							},
							logLevel: state.logLevel,
							onVideoTrack: state.onVideoTrack,
							registerVideoSampleCallback:
								state.callbacks.registerVideoSampleCallback,
							tracks: state.callbacks.tracks,
						});
						state.m3u.sampleSorter.addToStreamWithTrack(playlistUrl);

						if (onVideoSample === null) {
							return null;
						}

						state.m3u.sampleSorter.addVideoStreamToConsider(
							playlistUrl,
							onVideoSample,
						);

						return async (sample) => {
							await state.m3u.sampleSorter.addVideoSample(playlistUrl, sample);
						};
					},
			m3uState: state.m3u,
			parentController: state.controller,
			readerInterface: state.readerInterface,
		});

		run.catch((err) => {
			reject(err);
		});
	});
};
