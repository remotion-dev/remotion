import {mediaParserController} from '../../controller/media-parser-controller';
import {forwardMediaParserControllerPauseResume} from '../../forward-controller-pause-resume-abort';
import type {
	MediaParserAudioTrack,
	MediaParserVideoTrack,
} from '../../get-tracks';
import {parseMedia} from '../../parse-media';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import {type M3uRun} from '../../state/m3u-state';
import type {ParserState} from '../../state/parser-state';
import type {
	MediaParserOnAudioSample,
	MediaParserOnVideoSample,
} from '../../webcodec-sample-types';
import {withResolvers} from '../../with-resolvers';
import {considerSeekBasedOnChunk} from './first-sample-in-m3u-chunk';
import {getChunks} from './get-chunks';
import {getPlaylist} from './get-playlist';
import {getChunkToSeekTo} from './seek/get-chunk-to-seek-to';
import type {M3uStructure} from './types';

export type PendingSeek = {
	pending: number | null;
};

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

	const onGlobalAudioTrack = audioDone
		? null
		: async (
				track: MediaParserAudioTrack,
			): Promise<MediaParserOnAudioSample | null> => {
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

	const onGlobalVideoTrack = videoDone
		? null
		: async (
				track: MediaParserVideoTrack,
			): Promise<MediaParserOnVideoSample | null> => {
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

	// This function will run through the whole playlist step by step, and pause itself
	// On the next run it will continue
	const pausableIterator = async () => {
		const playlist = getPlaylist(structure, playlistUrl);
		const chunks = getChunks(playlist);
		const seekToSecondsToProcess =
			state.m3u.getSeekToSecondsToProcess(playlistUrl);
		const chunksToSubtract =
			state.m3u.getNextSeekShouldSubtractChunks(playlistUrl);
		let chunkIndex = null;

		if (seekToSecondsToProcess !== null) {
			chunkIndex = Math.max(
				0,
				getChunkToSeekTo({
					chunks,
					seekToSecondsToProcess: seekToSecondsToProcess.targetTime,
				}) - chunksToSubtract,
			);
		}

		const currentPromise = {
			resolver: (() => undefined) as (run: M3uRun | null) => void,
			rejector: reject,
		};

		const requiresHeaderToBeFetched = chunks[0].isHeader;

		for (const chunk of chunks) {
			const mp4HeaderSegment = state.m3u.getMp4HeaderSegment(playlistUrl);
			if (requiresHeaderToBeFetched && mp4HeaderSegment && chunk.isHeader) {
				continue;
			}

			if (
				chunkIndex !== null &&
				chunks.indexOf(chunk) < chunkIndex &&
				!chunk.isHeader
			) {
				continue;
			}

			currentPromise.resolver = (newRun: M3uRun | null) => {
				state.m3u.setM3uStreamRun(playlistUrl, newRun);
				resolve();
			};

			currentPromise.rejector = reject;
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
						const resolver = withResolvers<M3uRun | null>();
						currentPromise.resolver = resolver.resolve;
						currentPromise.rejector = resolver.reject;

						childController.resume();

						return resolver.promise;
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
				const data = await parseMedia({
					src,
					acknowledgeRemotionLicense: true,
					logLevel: state.logLevel,
					controller: childController,
					progressIntervalInMs: 0,
					onParseProgress: () => {
						childController.pause();
						currentPromise.resolver(makeContinuationFn());
					},
					fields: chunk.isHeader ? {slowStructure: true} : undefined,
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
						onGlobalAudioTrack === null
							? null
							: async ({track}) => {
									const callbackOrFalse =
										state.m3u.hasEmittedAudioTrack(playlistUrl);
									if (callbackOrFalse === false) {
										const callback = await onGlobalAudioTrack(track);

										if (!callback) {
											state.m3u.setHasEmittedAudioTrack(playlistUrl, null);
											return null;
										}

										state.m3u.setHasEmittedAudioTrack(playlistUrl, callback);
										return async (sample) => {
											await considerSeekBasedOnChunk({
												sample,
												callback,
												parentController: state.controller,
												childController,
												m3uState: state.m3u,
												playlistUrl,
												subtractChunks: chunksToSubtract,
												chunkIndex,
											});
										};
									}

									if (callbackOrFalse === null) {
										return null;
									}

									return async (sample) => {
										await considerSeekBasedOnChunk({
											sample,
											m3uState: state.m3u,
											playlistUrl,
											callback: callbackOrFalse,
											parentController: state.controller,
											childController,
											subtractChunks: chunksToSubtract,
											chunkIndex,
										});
									};
								},
					onVideoTrack:
						onGlobalVideoTrack === null
							? null
							: async ({track}) => {
									const callbackOrFalse =
										state.m3u.hasEmittedVideoTrack(playlistUrl);
									if (callbackOrFalse === false) {
										const callback = await onGlobalVideoTrack({
											...track,
											m3uStreamFormat:
												chunk.isHeader || mp4HeaderSegment ? 'mp4' : 'ts',
										});

										if (!callback) {
											state.m3u.setHasEmittedVideoTrack(playlistUrl, null);
											return null;
										}

										state.m3u.setHasEmittedVideoTrack(playlistUrl, callback);
										return async (sample) => {
											await considerSeekBasedOnChunk({
												sample,
												m3uState: state.m3u,
												playlistUrl,
												callback,
												parentController: state.controller,
												childController,
												subtractChunks: chunksToSubtract,
												chunkIndex,
											});
										};
									}

									if (callbackOrFalse === null) {
										return null;
									}

									return async (sample) => {
										await considerSeekBasedOnChunk({
											sample,
											m3uState: state.m3u,
											playlistUrl,
											callback: callbackOrFalse,
											parentController: state.controller,
											childController,
											subtractChunks: chunksToSubtract,
											chunkIndex,
										});
									};
								},
					reader: state.readerInterface,
					makeSamplesStartAtZero: false,
					m3uPlaylistContext: {
						mp4HeaderSegment,
						isLastChunkInPlaylist: isLastChunk,
					},
				});

				if (chunk.isHeader) {
					if (data.slowStructure.type !== 'iso-base-media') {
						throw new Error('Expected an mp4 file');
					}

					state.m3u.setMp4HeaderSegment(playlistUrl, data.slowStructure);
				}
			} catch (e) {
				currentPromise.rejector(e as Error);
				throw e;
			}

			forwarded.cleanup();

			if (!isLastChunk) {
				childController.pause();
				currentPromise.resolver(makeContinuationFn());
			}
		}

		currentPromise.resolver(null);
	};

	const run = pausableIterator();

	run.catch((err) => {
		reject(err);
	});

	return promise;
};
