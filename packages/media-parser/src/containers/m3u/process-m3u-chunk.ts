import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {withResolvers} from '../../with-resolvers';
import {iteratorOverSegmentFiles} from './iterate-over-segment-files';
import type {M3uStructure} from './types';

export const processM3uChunk = ({
	playlistUrl,
	state,
	structure,
	audioDone,
	videoDone,
}: {
	playlistUrl: string;
	state: ParserState;
	structure: M3uStructure;
	audioDone: boolean;
	videoDone: boolean;
}) => {
	const {promise, reject, resolve} = withResolvers<void>();

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

	return promise;
};
