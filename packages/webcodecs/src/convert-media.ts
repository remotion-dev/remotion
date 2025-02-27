/**
 * Copyright (c) 2025 Remotion AG
 * For licensing, see: https://remotion.dev/docs/webcodecs#license
 */

import type {
	AudioTrack,
	LogLevel,
	OnAudioTrack,
	Options,
	ParseMediaFields,
	ParseMediaOptions,
	VideoTrack,
	WriterInterface,
} from '@remotion/media-parser';
import {
	defaultSelectM3uAssociatedPlaylists,
	defaultSelectM3uStreamFn,
	MediaParserAbortError,
	MediaParserInternals,
	type OnVideoTrack,
} from '@remotion/media-parser';

import type {ParseMediaCallbacks} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {autoSelectWriter} from './auto-select-writer';
import {calculateProgress} from './calculate-progress';
import {makeProgressTracker} from './create/progress-tracker';
import {withResolversAndWaitForReturn} from './create/with-resolvers';
import {generateOutputFilename} from './generate-output-filename';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import {
	availableContainers,
	type ConvertMediaContainer,
} from './get-available-containers';
import {
	availableVideoCodecs,
	type ConvertMediaVideoCodec,
} from './get-available-video-codecs';
import {Log} from './log';
import {makeAudioTrackHandler} from './on-audio-track';
import {type ConvertMediaOnAudioTrackHandler} from './on-audio-track-handler';
import {makeVideoTrackHandler} from './on-video-track';
import {type ConvertMediaOnVideoTrackHandler} from './on-video-track-handler';
import type {ResizeOperation} from './resizing/mode';
import {selectContainerCreator} from './select-container-creator';
import {sendUsageEvent} from './send-telemetry-event';
import {throttledStateUpdate} from './throttled-state-update';
import {
	webcodecsController,
	type WebCodecsController,
} from './webcodecs-controller';

export type ConvertMediaProgress = {
	decodedVideoFrames: number;
	decodedAudioFrames: number;
	encodedVideoFrames: number;
	encodedAudioFrames: number;
	bytesWritten: number;
	millisecondsWritten: number;
	expectedOutputDurationInMs: number | null;
	overallProgress: number | null;
};

export type ConvertMediaResult = {
	save: () => Promise<Blob>;
	remove: () => Promise<void>;
	finalState: ConvertMediaProgress;
};

export type ConvertMediaOnProgress = (state: ConvertMediaProgress) => void;
export type ConvertMediaOnVideoFrame = (options: {
	frame: VideoFrame;
	track: VideoTrack;
}) => Promise<VideoFrame> | VideoFrame;
export type ConvertMediaOnAudioData = (options: {
	audioData: AudioData;
	track: AudioTrack;
}) => Promise<AudioData> | AudioData;

export const convertMedia = async function <
	F extends Options<ParseMediaFields>,
>({
	src,
	onVideoFrame,
	onAudioData,
	onProgress: onProgressDoNotCallDirectly,
	audioCodec,
	container,
	videoCodec,
	controller = webcodecsController(),
	onAudioTrack: userAudioResolver,
	onVideoTrack: userVideoResolver,
	reader,
	fields,
	logLevel = 'info',
	writer,
	progressIntervalInMs,
	rotate,
	apiKey,
	resize,
	onAudioCodec,
	onContainer,
	onDimensions,
	onDurationInSeconds,
	onFps,
	onImages,
	onInternalStats,
	onIsHdr,
	onKeyframes,
	onLocation,
	onMetadata,
	onMimeType,
	onName,
	onNumberOfAudioChannels,
	onRotation,
	onSampleRate,
	onSize,
	onSlowAudioBitrate,
	onSlowDurationInSeconds,
	onSlowFps,
	onSlowKeyframes,
	onSlowNumberOfFrames,
	onSlowVideoBitrate,
	onStructure,
	onTracks,
	onUnrotatedDimensions,
	onVideoCodec,
	onM3uStreams,
	selectM3uStream,
	selectM3uAssociatedPlaylists,
	...more
}: {
	src: ParseMediaOptions<F>['src'];
	container: ConvertMediaContainer;
	onVideoFrame?: ConvertMediaOnVideoFrame;
	onAudioData?: ConvertMediaOnAudioData;
	onProgress?: ConvertMediaOnProgress;
	videoCodec?: ConvertMediaVideoCodec;
	audioCodec?: ConvertMediaAudioCodec;
	controller?: WebCodecsController;
	onAudioTrack?: ConvertMediaOnAudioTrackHandler;
	onVideoTrack?: ConvertMediaOnVideoTrackHandler;
	selectM3uStream?: ParseMediaOptions<F>['selectM3uStream'];
	selectM3uAssociatedPlaylists?: ParseMediaOptions<F>['selectM3uAssociatedPlaylists'];
	reader?: ParseMediaOptions<F>['reader'];
	logLevel?: LogLevel;
	writer?: WriterInterface;
	progressIntervalInMs?: number;
	rotate?: number;
	resize?: ResizeOperation;
	apiKey?: string | null;
	fields?: F;
} & ParseMediaCallbacks): Promise<ConvertMediaResult> {
	if (controller._internals.signal.aborted) {
		return Promise.reject(new MediaParserAbortError('Aborted'));
	}

	if (availableContainers.indexOf(container) === -1) {
		return Promise.reject(
			new TypeError(
				`Only the following values for "container" are supported currently: ${JSON.stringify(availableContainers)}`,
			),
		);
	}

	if (videoCodec && availableVideoCodecs.indexOf(videoCodec) === -1) {
		return Promise.reject(
			new TypeError(
				`Only the following values for "videoCodec" are supported currently: ${JSON.stringify(availableVideoCodecs)}`,
			),
		);
	}

	const {resolve, reject, getPromiseToImmediatelyReturn} =
		withResolversAndWaitForReturn<ConvertMediaResult>();

	const abortConversion = (errCause: Error) => {
		reject(errCause);

		if (!controller._internals.signal.aborted) {
			controller.abort();
		}
	};

	const onUserAbort = () => {
		abortConversion(new MediaParserAbortError('Conversion aborted by user'));
	};

	controller._internals.signal.addEventListener('abort', onUserAbort);

	const creator = selectContainerCreator(container);

	const throttledState = throttledStateUpdate({
		updateFn: onProgressDoNotCallDirectly ?? null,
		everyMilliseconds: progressIntervalInMs ?? 100,
		signal: controller._internals.signal,
	});

	const progressTracker = makeProgressTracker();

	const state = await creator({
		filename: generateOutputFilename(src, container),
		writer: await autoSelectWriter(writer, logLevel),
		onBytesProgress: (bytesWritten) => {
			throttledState.update?.((prevState) => {
				return {
					...prevState,
					bytesWritten,
				};
			});
		},
		onMillisecondsProgress: (millisecondsWritten) => {
			throttledState.update?.((prevState) => {
				if (millisecondsWritten > prevState.millisecondsWritten) {
					return {
						...prevState,
						millisecondsWritten,
						overallProgress: calculateProgress({
							millisecondsWritten: prevState.millisecondsWritten,
							expectedOutputDurationInMs: prevState.expectedOutputDurationInMs,
						}),
					};
				}

				return prevState;
			});
		},
		logLevel,
		progressTracker,
	});

	const onVideoTrack: OnVideoTrack = makeVideoTrackHandler({
		state,
		onVideoFrame: onVideoFrame ?? null,
		onMediaStateUpdate: throttledState.update ?? null,
		abortConversion,
		controller,
		defaultVideoCodec: videoCodec ?? null,
		onVideoTrack: userVideoResolver ?? null,
		logLevel,
		outputContainer: container,
		rotate: rotate ?? 0,
		progress: progressTracker,
		resizeOperation: resize ?? null,
	});

	const onAudioTrack: OnAudioTrack = makeAudioTrackHandler({
		abortConversion,
		defaultAudioCodec: audioCodec ?? null,
		controller,
		onMediaStateUpdate: throttledState.update ?? null,
		state,
		onAudioTrack: userAudioResolver ?? null,
		logLevel,
		outputContainer: container,
		progressTracker,
		onAudioData: onAudioData ?? null,
	});

	MediaParserInternals.internalParseMedia({
		logLevel,
		src,
		onVideoTrack,
		onAudioTrack,
		controller,
		fields: {
			...fields,
			durationInSeconds: true,
		},
		reader: reader ?? fetchReader,
		...more,
		onDurationInSeconds: (durationInSeconds) => {
			if (durationInSeconds === null) {
				return null;
			}

			const casted = more as ParseMediaOptions<{
				durationInSeconds: true;
			}>;
			if (casted.onDurationInSeconds) {
				casted.onDurationInSeconds(durationInSeconds);
			}

			const expectedOutputDurationInMs = durationInSeconds * 1000;
			throttledState.update?.((prevState) => {
				return {
					...prevState,
					expectedOutputDurationInMs,
					overallProgress: calculateProgress({
						millisecondsWritten: prevState.millisecondsWritten,
						expectedOutputDurationInMs,
					}),
				};
			});
		},
		acknowledgeRemotionLicense: true,
		mode: 'query',
		onDiscardedData: null,
		onError: () => ({action: 'fail'}),
		onParseProgress: null,
		progressIntervalInMs: null,
		onAudioCodec: onAudioCodec ?? null,
		onContainer: onContainer ?? null,
		onDimensions: onDimensions ?? null,
		onFps: onFps ?? null,
		onImages: onImages ?? null,
		onInternalStats: onInternalStats ?? null,
		onIsHdr: onIsHdr ?? null,
		onKeyframes: onKeyframes ?? null,
		onLocation: onLocation ?? null,
		onMetadata: onMetadata ?? null,
		onMimeType: onMimeType ?? null,
		onName: onName ?? null,
		onNumberOfAudioChannels: onNumberOfAudioChannels ?? null,
		onRotation: onRotation ?? null,
		onSampleRate: onSampleRate ?? null,
		onSize: onSize ?? null,
		onSlowAudioBitrate: onSlowAudioBitrate ?? null,
		onSlowDurationInSeconds: onSlowDurationInSeconds ?? null,
		onSlowFps: onSlowFps ?? null,
		onSlowKeyframes: onSlowKeyframes ?? null,
		onSlowNumberOfFrames: onSlowNumberOfFrames ?? null,
		onSlowVideoBitrate: onSlowVideoBitrate ?? null,
		onStructure: onStructure ?? null,
		onTracks: onTracks ?? null,
		onUnrotatedDimensions: onUnrotatedDimensions ?? null,
		onVideoCodec: onVideoCodec ?? null,
		apiName: 'convertMedia()',
		onM3uStreams: onM3uStreams ?? null,
		selectM3uStream: selectM3uStream ?? defaultSelectM3uStreamFn,
		selectM3uAssociatedPlaylists:
			selectM3uAssociatedPlaylists ?? defaultSelectM3uAssociatedPlaylists,
	})
		.then(() => {
			return state.waitForFinish();
		})
		.then(() => {
			resolve({
				save: state.getBlob,
				remove: state.remove,
				finalState: throttledState.get(),
			});
		})
		.then(() => {
			sendUsageEvent({succeeded: true, apiKey: apiKey ?? null}).catch((err) => {
				Log.error('Failed to send usage event', err);
			});
		})
		.catch((err) => {
			sendUsageEvent({succeeded: false, apiKey: apiKey ?? null}).catch(
				(err2) => {
					Log.error('Failed to send usage event', err2);
				},
			);
			reject(err);
		})
		.finally(() => {
			throttledState.stopAndGetLastProgress();
		});

	return getPromiseToImmediatelyReturn().finally(() => {
		controller._internals.signal.removeEventListener('abort', onUserAbort);
	});
};
