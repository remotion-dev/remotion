import {forwardMediaParserController} from '../../forward-controller';
import type {AudioTrack, VideoTrack} from '../../get-tracks';
import type {LogLevel} from '../../log';
import type {MediaParserController} from '../../media-parser-controller';
import {mediaParserController} from '../../media-parser-controller';
import {parseMedia} from '../../parse-media';
import type {ExistingM3uRun, M3uState} from '../../state/m3u-state';
import type {OnAudioSample, OnVideoSample} from '../../webcodec-sample-types';
import {getChunks} from './get-chunks';
import {getPlaylist} from './get-playlist';
import type {M3uStructure} from './types';

export const iteratorOverTsFiles = async ({
	structure,
	onVideoTrack,
	m3uState,
	onAudioTrack,
	onDoneWithTracks,
	playlistUrl,
	logLevel,
	parentController,
	onInitialProgress,
}: {
	structure: M3uStructure;
	onVideoTrack: (track: VideoTrack) => Promise<OnVideoSample | null>;
	onAudioTrack: (track: AudioTrack) => Promise<OnAudioSample | null>;
	onDoneWithTracks: () => void;
	m3uState: M3uState;
	playlistUrl: string;
	logLevel: LogLevel;
	parentController: MediaParserController;
	onInitialProgress: (run: ExistingM3uRun | null) => void;
}) => {
	const playlist = getPlaylist(structure, playlistUrl);
	const chunks = getChunks(playlist);

	let resolver: (run: ExistingM3uRun | null) => void = onInitialProgress;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let rejector = (_e: Error) => {};

	const childController = mediaParserController();
	const forwarded = forwardMediaParserController({
		childController,
		parentController,
	});

	const makeContinuationFn = (): ExistingM3uRun => {
		return {
			continue() {
				const {promise, reject, resolve} =
					Promise.withResolvers<ExistingM3uRun | null>();
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

	for (const chunk of chunks) {
		const isLastChunk = chunk === chunks[chunks.length - 1];
		await childController._internals.checkForAbortAndPause();
		const src = new URL(chunk.url, playlistUrl).toString();

		try {
			await parseMedia({
				src,
				acknowledgeRemotionLicense: true,
				logLevel,
				controller: childController,
				progressIntervalInMs: 0,
				onParseProgress: () => {
					childController.pause();
					resolver(makeContinuationFn());
				},
				onTracks: () => {
					if (!m3uState.hasEmittedDoneWithTracks(playlistUrl)) {
						m3uState.setHasEmittedDoneWithTracks(playlistUrl);
						onDoneWithTracks();
						return null;
					}
				},
				onAudioTrack: async ({track}) => {
					const callbackOrFalse = m3uState.hasEmittedAudioTrack(playlistUrl);
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
				onVideoTrack: async ({track}) => {
					const callbackOrFalse = m3uState.hasEmittedVideoTrack(playlistUrl);
					if (callbackOrFalse === false) {
						const callback = await onVideoTrack(track);

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
			});
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
