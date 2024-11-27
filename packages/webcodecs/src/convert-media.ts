/**
 * Copyright (c) 2024 Remotion AG
 * For licensing, see: https://remotion.dev/docs/webcodecs#license
 */

import type {
	LogLevel,
	OnAudioTrack,
	Options,
	ParseMediaDynamicOptions,
	ParseMediaFields,
	ParseMediaOptions,
	VideoTrack,
	WriterInterface,
} from '@remotion/media-parser';
import {parseMedia, type OnVideoTrack} from '@remotion/media-parser';

import {autoSelectWriter} from './auto-select-writer';
import {calculateProgress} from './calculate-progress';
import Error from './error-cause';
import {generateOutputFilename} from './generate-output-filename';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {makeAudioTrackHandler} from './on-audio-track';
import {type ConvertMediaOnAudioTrackHandler} from './on-audio-track-handler';
import {makeVideoTrackHandler} from './on-video-track';
import {type ConvertMediaOnVideoTrackHandler} from './on-video-track-handler';
import {selectContainerCreator} from './select-container-creator';
import {throttledStateUpdate} from './throttled-state-update';
import {withResolversAndWaitForReturn} from './with-resolvers';

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

export const convertMedia = async function <
	F extends Options<ParseMediaFields>,
>({
	src,
	onVideoFrame,
	onProgress: onProgressDoNotCallDirectly,
	audioCodec,
	container,
	videoCodec,
	signal: userPassedAbortSignal,
	onAudioTrack: userAudioResolver,
	onVideoTrack: userVideoResolver,
	reader,
	fields,
	logLevel = 'info',
	writer,
	progressIntervalInMs,
	rotate,
	...more
}: {
	src: ParseMediaOptions<F>['src'];
	container: ConvertMediaContainer;
	onVideoFrame?: ConvertMediaOnVideoFrame;
	onProgress?: ConvertMediaOnProgress;
	videoCodec?: ConvertMediaVideoCodec;
	audioCodec?: ConvertMediaAudioCodec;
	signal?: AbortSignal;
	onAudioTrack?: ConvertMediaOnAudioTrackHandler;
	onVideoTrack?: ConvertMediaOnVideoTrackHandler;
	reader?: ParseMediaOptions<F>['reader'];
	logLevel?: LogLevel;
	writer?: WriterInterface;
	progressIntervalInMs?: number;
	rotate?: number;
} & ParseMediaDynamicOptions<F>): Promise<ConvertMediaResult> {
	if (userPassedAbortSignal?.aborted) {
		return Promise.reject(new Error('Aborted'));
	}

	if (container !== 'webm' && container !== 'mp4' && container !== 'wav') {
		return Promise.reject(
			new TypeError(
				'Only `to: "webm"`, `to: "mp4"` and `to: "wav"` is supported currently',
			),
		);
	}

	if (videoCodec && videoCodec !== 'vp8' && videoCodec !== 'vp9') {
		return Promise.reject(
			new TypeError(
				'Only `videoCodec: "vp8"` and `videoCodec: "vp9"` are supported currently',
			),
		);
	}

	const {resolve, reject, getPromiseToImmediatelyReturn} =
		withResolversAndWaitForReturn<ConvertMediaResult>();
	const controller = new AbortController();

	const abortConversion = (errCause: Error) => {
		reject(errCause);

		if (!controller.signal.aborted) {
			controller.abort();
		}
	};

	const onUserAbort = () => {
		abortConversion(new Error('Conversion aborted by user'));
	};

	userPassedAbortSignal?.addEventListener('abort', onUserAbort);

	const creator = selectContainerCreator(container);

	const throttledState = throttledStateUpdate({
		updateFn: onProgressDoNotCallDirectly ?? null,
		everyMilliseconds: progressIntervalInMs ?? 100,
		signal: controller.signal,
	});

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
		container,
		rotate: rotate ?? 0,
	});

	const onAudioTrack: OnAudioTrack = makeAudioTrackHandler({
		abortConversion,
		defaultAudioCodec: audioCodec ?? null,
		controller,
		onMediaStateUpdate: throttledState.update ?? null,
		state,
		onAudioTrack: userAudioResolver ?? null,
		logLevel,
		container,
	});

	parseMedia({
		logLevel,
		src,
		onVideoTrack,
		onAudioTrack,
		signal: controller.signal,
		fields: {
			...fields,
			durationInSeconds: true,
		},
		reader,
		...more,
		onDurationInSeconds: (durationInSeconds) => {
			if (durationInSeconds === null) {
				return null;
			}

			const casted = more as ParseMediaDynamicOptions<{
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
	})
		.then(() => {
			return state.waitForFinish();
		})
		.then(() => {
			resolve({
				save: state.save,
				remove: state.remove,
				finalState: throttledState.get(),
			});
		})
		.catch((err) => {
			reject(err);
		})
		.finally(() => {
			throttledState.stopAndGetLastProgress();
		});

	return getPromiseToImmediatelyReturn().finally(() => {
		userPassedAbortSignal?.removeEventListener('abort', onUserAbort);
	});
};
