import {mediaParserController} from '../../controller/media-parser-controller';
import {forwardMediaParserControllerPauseResume} from '../../forward-controller-pause-resume-abort';
import type {AudioTrack, VideoTrack} from '../../get-tracks';
import {parseMedia} from '../../parse-media';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import {type M3uRun} from '../../state/m3u-state';
import type {ParserState} from '../../state/parser-state';
import type {OnAudioSample, OnVideoSample} from '../../webcodec-sample-types';
import {withResolvers} from '../../with-resolvers';
import {getChunks} from './get-chunks';
import {getPlaylist} from './get-playlist';
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

	const onAudioTrack = audioDone
		? null
		: async (track: AudioTrack): Promise<OnAudioSample | null> => {
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
			};

	const onVideoTrack = videoDone
		? null
		: async (track: VideoTrack): Promise<OnVideoSample | null> => {
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
			};

	const iteratorOverSegmentFiles = async () => {
		const playlist = getPlaylist(structure, playlistUrl);
		const chunks = getChunks(playlist);
		let resolver: (run: M3uRun | null) => void = () => undefined;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		let rejector = (_e: Error) => {};

		for (const chunk of chunks) {
			resolver = (newRun: M3uRun | null) => {
				state.m3u.setM3uStreamRun(playlistUrl, newRun);
				resolve();
			};

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			rejector = (_e: Error) => {};
			const childController = mediaParserController();
			const forwarded = forwardMediaParserControllerPauseResume({
				childController,
				parentController: state.controller,
			});

			const nextChunk = chunks[chunks.indexOf(chunk) + 1];
			if (nextChunk) {
				const nextChunkSource = state.readerInterface.createAdjacentFileSource(
					nextChunk.url,
					playlistUrl,
				);
				state.readerInterface.preload({
					logLevel: state.logLevel,
					range: null,
					src: nextChunkSource,
					prefetchCache: state.prefetchCache,
				});
			}

			const makeContinuationFn = (): M3uRun => {
				return {
					continue() {
						const {
							promise: promise_,
							reject: reject_,
							resolve: resolve_,
						} = withResolvers<M3uRun | null>();
						resolver = resolve_;
						rejector = reject_;
						childController.resume();
						return promise_;
					},
					abort() {
						childController.abort();
					},
				};
			};

			const isLastChunk = chunk === chunks[chunks.length - 1];
			await childController._internals.checkForAbortAndPause();
			const src = state.readerInterface.createAdjacentFileSource(
				chunk.url,
				playlistUrl,
			);

			try {
				const mp4HeaderSegment = state.m3u.getMp4HeaderSegment(playlistUrl);
				const data = await parseMedia({
					src,
					acknowledgeRemotionLicense: true,
					logLevel: state.logLevel,
					controller: childController,
					progressIntervalInMs: 0,
					onParseProgress: () => {
						childController.pause();
						resolver(makeContinuationFn());
					},
					fields: chunk.isHeader ? {structure: true} : undefined,
					onTracks: () => {
						if (!state.m3u.hasEmittedDoneWithTracks(playlistUrl)) {
							state.m3u.setHasEmittedDoneWithTracks(playlistUrl);
							const allDone = state.m3u.setTracksDone(playlistUrl);
							if (allDone) {
								state.callbacks.tracks.setIsDone(state.logLevel);
							}

							return null;
						}
					},
					onAudioTrack:
						onAudioTrack === null
							? null
							: async ({track}) => {
									const callbackOrFalse =
										state.m3u.hasEmittedAudioTrack(playlistUrl);
									if (callbackOrFalse === false) {
										const callback = await onAudioTrack(track);

										if (!callback) {
											state.m3u.setHasEmittedAudioTrack(playlistUrl, null);
											return null;
										}

										state.m3u.setHasEmittedAudioTrack(playlistUrl, callback);
										return (sample) => {
											return callback(sample);
										};
									}

									return callbackOrFalse;
								},
					onVideoTrack:
						onVideoTrack === null
							? null
							: async ({track}) => {
									const callbackOrFalse =
										state.m3u.hasEmittedVideoTrack(playlistUrl);
									if (callbackOrFalse === false) {
										const callback = await onVideoTrack({
											...track,
											m3uStreamFormat:
												chunk.isHeader || mp4HeaderSegment ? 'mp4' : 'ts',
										});

										if (!callback) {
											state.m3u.setHasEmittedVideoTrack(playlistUrl, null);
											return null;
										}

										state.m3u.setHasEmittedVideoTrack(playlistUrl, callback);
										return (sample) => {
											return callback(sample);
										};
									}

									return callbackOrFalse;
								},
					reader: state.readerInterface,
					mp4HeaderSegment,
					makeSamplesStartAtZero: false,
				});
				if (chunk.isHeader) {
					if (data.structure.type !== 'iso-base-media') {
						throw new Error('Expected an mp4 file');
					}

					state.m3u.setMp4HeaderSegment(playlistUrl, data.structure);
				}
			} catch (e) {
				rejector(e as Error);
				throw e;
			}

			forwarded.cleanup();

			if (!isLastChunk) {
				childController.pause();
				resolver(makeContinuationFn());
			}
		}

		resolver(null);
	};

	const run = iteratorOverSegmentFiles();

	run.catch((err) => {
		reject(err);
	});

	return promise;
};
