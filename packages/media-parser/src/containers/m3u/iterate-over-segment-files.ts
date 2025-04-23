import type {MediaParserController} from '../../controller/media-parser-controller';
import {mediaParserController} from '../../controller/media-parser-controller';
import {forwardMediaParserControllerPauseResume} from '../../forward-controller-pause-resume-abort';
import type {AudioTrack, VideoTrack} from '../../get-tracks';
import type {LogLevel} from '../../log';
import {parseMedia} from '../../parse-media';
import type {ReaderInterface} from '../../readers/reader';
import type {ExistingM3uRun, M3uState} from '../../state/m3u-state';
import type {OnAudioSample, OnVideoSample} from '../../webcodec-sample-types';
import {withResolvers} from '../../with-resolvers';
import {getChunks} from './get-chunks';
import {getPlaylist} from './get-playlist';
import type {M3uStructure} from './types';

export const iteratorOverSegmentFiles = async ({
	structure,
	onVideoTrack,
	m3uState,
	onAudioTrack,
	onDoneWithTracks,
	playlistUrl,
	logLevel,
	parentController,
	onInitialProgress,
	readerInterface,
}: {
	structure: M3uStructure;
	onVideoTrack: null | ((track: VideoTrack) => Promise<OnVideoSample | null>);
	onAudioTrack: null | ((track: AudioTrack) => Promise<OnAudioSample | null>);
	onDoneWithTracks: () => void;
	m3uState: M3uState;
	playlistUrl: string;
	logLevel: LogLevel;
	parentController: MediaParserController;
	onInitialProgress: (run: ExistingM3uRun | null) => void;
	readerInterface: ReaderInterface;
}) => {
	const playlist = getPlaylist(structure, playlistUrl);
	const chunks = getChunks(playlist);
	let resolver: (run: ExistingM3uRun | null) => void = onInitialProgress;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let rejector = (_e: Error) => {};

	for (const chunk of chunks) {
		resolver = onInitialProgress;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		rejector = (_e: Error) => {};
		const childController = mediaParserController();
		const forwarded = forwardMediaParserControllerPauseResume({
			childController,
			parentController,
		});

		const nextChunk = chunks[chunks.indexOf(chunk) + 1];
		if (nextChunk) {
			const nextChunkSource = readerInterface.createAdjacentFileSource(
				nextChunk.url,
				playlistUrl,
			);
			m3uState.trackPreloadRequest({
				src: nextChunkSource,
				range: null,
			});
			readerInterface.preload({
				logLevel,
				range: null,
				src: nextChunkSource,
			});
		}

		const makeContinuationFn = (): ExistingM3uRun => {
			return {
				continue() {
					const {promise, reject, resolve} =
						withResolvers<ExistingM3uRun | null>();
					resolver = resolve;
					rejector = reject;
					childController.resume();
					return promise;
				},
				abort() {
					childController.abort();
				},
			};
		};

		const isLastChunk = chunk === chunks[chunks.length - 1];
		await childController._internals.checkForAbortAndPause();
		const src = readerInterface.createAdjacentFileSource(
			chunk.url,
			playlistUrl,
		);

		try {
			const mp4HeaderSegment = m3uState.getMp4HeaderSegment(playlistUrl);
			const data = await parseMedia({
				src,
				acknowledgeRemotionLicense: true,
				logLevel,
				controller: childController,
				progressIntervalInMs: 0,
				onParseProgress: () => {
					childController.pause();
					resolver(makeContinuationFn());
				},
				fields: chunk.isHeader ? {structure: true} : undefined,
				onTracks: () => {
					if (!m3uState.hasEmittedDoneWithTracks(playlistUrl)) {
						m3uState.setHasEmittedDoneWithTracks(playlistUrl);
						onDoneWithTracks();
						return null;
					}
				},
				onAudioTrack:
					onAudioTrack === null
						? null
						: async ({track}) => {
								const callbackOrFalse =
									m3uState.hasEmittedAudioTrack(playlistUrl);
								if (callbackOrFalse === false) {
									const callback = await onAudioTrack(track);

									if (!callback) {
										m3uState.setHasEmittedAudioTrack(playlistUrl, null);
										return null;
									}

									m3uState.setHasEmittedAudioTrack(playlistUrl, callback);
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
									m3uState.hasEmittedVideoTrack(playlistUrl);
								if (callbackOrFalse === false) {
									const callback = await onVideoTrack({
										...track,
										m3uStreamFormat:
											chunk.isHeader || mp4HeaderSegment ? 'mp4' : 'ts',
									});

									if (!callback) {
										m3uState.setHasEmittedVideoTrack(playlistUrl, null);
										return null;
									}

									m3uState.setHasEmittedVideoTrack(playlistUrl, callback);
									return (sample) => {
										return callback(sample);
									};
								}

								return callbackOrFalse;
							},
				reader: readerInterface,
				mp4HeaderSegment,
				makeSamplesStartAtZero: false,
			});
			if (chunk.isHeader) {
				if (data.structure.type !== 'iso-base-media') {
					throw new Error('Expected an mp4 file');
				}

				m3uState.setMp4HeaderSegment(playlistUrl, data.structure);
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
