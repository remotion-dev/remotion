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
import {
	MediaParserInternals,
	parseMedia,
	type OnVideoTrack,
} from '@remotion/media-parser';

import {autoSelectWriter} from './auto-select-writer';
import {calculateProgress} from './calculate-progress';
import type {
	ConvertMediaAudioCodec,
	ConvertMediaContainer,
	ConvertMediaVideoCodec,
} from './codec-id';
import Error from './error-cause';
import {generateOutputFilename} from './generate-output-filename';
import {makeAudioTrackHandler} from './on-audio-track';
import {type ConvertMediaOnAudioTrackHandler} from './on-audio-track-handler';
import {makeVideoTrackHandler} from './on-video-track';
import {type ConvertMediaOnVideoTrackHandler} from './on-video-track-handler';
import {withResolversAndWaitForReturn} from './with-resolvers';

export type ConvertMediaState = {
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
	finalState: ConvertMediaState;
};

export type ConvertMediaOnMediaStateUpdate = (state: ConvertMediaState) => void;
export type ConvertMediaOnVideoFrame = (options: {
	frame: VideoFrame;
	track: VideoTrack;
}) => Promise<VideoFrame> | VideoFrame;

export const convertMedia = async function <
	F extends Options<ParseMediaFields>,
>({
	src,
	onVideoFrame,
	onMediaStateUpdate: onMediaStateDoNoCallDirectly,
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
	...more
}: {
	src: ParseMediaOptions<F>['src'];
	container: ConvertMediaContainer;
	onVideoFrame?: ConvertMediaOnVideoFrame;
	onMediaStateUpdate?: ConvertMediaOnMediaStateUpdate;
	videoCodec?: ConvertMediaVideoCodec;
	audioCodec?: ConvertMediaAudioCodec;
	signal?: AbortSignal;
	onAudioTrack?: ConvertMediaOnAudioTrackHandler;
	onVideoTrack?: ConvertMediaOnVideoTrackHandler;
	reader?: ParseMediaOptions<F>['reader'];
	logLevel?: LogLevel;
	writer?: WriterInterface;
} & ParseMediaDynamicOptions<F>): Promise<ConvertMediaResult> {
	if (userPassedAbortSignal?.aborted) {
		return Promise.reject(new Error('Aborted'));
	}

	if (container !== 'webm' && container !== 'mp4') {
		return Promise.reject(
			new TypeError('Only `to: "webm"` and `to: "mp4"` is supported currently'),
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

	const convertMediaState: ConvertMediaState = {
		decodedAudioFrames: 0,
		decodedVideoFrames: 0,
		encodedVideoFrames: 0,
		encodedAudioFrames: 0,
		bytesWritten: 0,
		millisecondsWritten: 0,
		expectedOutputDurationInMs: null,
		overallProgress: 0,
	};

	const onMediaStateUpdate = (newState: ConvertMediaState) => {
		if (controller.signal.aborted) {
			return;
		}

		onMediaStateDoNoCallDirectly?.(newState);
	};

	const creator =
		container === 'webm'
			? MediaParserInternals.createMatroskaMedia
			: MediaParserInternals.createIsoBaseMedia;

	const state = await creator({
		filename: generateOutputFilename(src, container),
		writer: await autoSelectWriter(writer, logLevel),
		onBytesProgress: (bytesWritten) => {
			convertMediaState.bytesWritten = bytesWritten;
			onMediaStateUpdate?.(convertMediaState);
		},
		onMillisecondsProgress: (millisecondsWritten) => {
			if (millisecondsWritten > convertMediaState.millisecondsWritten) {
				convertMediaState.millisecondsWritten = millisecondsWritten;
				convertMediaState.overallProgress = calculateProgress({
					millisecondsWritten: convertMediaState.millisecondsWritten,
					expectedOutputDurationInMs:
						convertMediaState.expectedOutputDurationInMs,
				});

				onMediaStateUpdate?.(convertMediaState);
			}
		},
		logLevel,
	});

	const onVideoTrack: OnVideoTrack = makeVideoTrackHandler({
		state,
		onVideoFrame: onVideoFrame ?? null,
		onMediaStateUpdate: onMediaStateUpdate ?? null,
		abortConversion,
		convertMediaState,
		controller,
		defaultVideoCodec: videoCodec ?? null,
		onVideoTrack: userVideoResolver ?? null,
		logLevel,
		container,
	});

	const onAudioTrack: OnAudioTrack = makeAudioTrackHandler({
		abortConversion,
		defaultAudioCodec: audioCodec ?? null,
		controller,
		convertMediaState,
		onMediaStateUpdate: onMediaStateUpdate ?? null,
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
			convertMediaState.expectedOutputDurationInMs = expectedOutputDurationInMs;
			convertMediaState.overallProgress = calculateProgress({
				millisecondsWritten: convertMediaState.millisecondsWritten,
				expectedOutputDurationInMs,
			});
			onMediaStateUpdate(convertMediaState);
		},
	})
		.then(() => {
			return state.waitForFinish();
		})
		.then(() => {
			resolve({
				save: state.save,
				remove: state.remove,
				finalState: convertMediaState,
			});
		})
		.catch((err) => {
			reject(err);
		});

	return getPromiseToImmediatelyReturn().finally(() => {
		userPassedAbortSignal?.removeEventListener('abort', onUserAbort);
	});
};
