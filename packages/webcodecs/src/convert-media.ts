import type {OnAudioTrack, VideoTrack} from '@remotion/media-parser';
import {
	MediaParserInternals,
	parseMedia,
	type OnVideoTrack,
} from '@remotion/media-parser';
import {bufferWriter} from '@remotion/media-parser/buffer';
import {canUseWebFsWriter, webFsWriter} from '@remotion/media-parser/web-fs';
import type {ConvertMediaAudioCodec, ConvertMediaVideoCodec} from './codec-id';
import Error from './error-cause';
import {makeAudioTrackHandler} from './on-audio-track';
import {makeVideoTrackHandler} from './on-video-track';
import {
	defaultResolveAudioAction,
	type ResolveAudioActionFn,
} from './resolve-audio-action';
import {
	defaultResolveVideoAction,
	type ResolveVideoActionFn,
} from './resolve-video-action';
import {withResolvers} from './with-resolvers';

export type ConvertMediaState = {
	decodedVideoFrames: number;
	decodedAudioFrames: number;
	encodedVideoFrames: number;
	encodedAudioFrames: number;
};

export type ConvertMediaTo = 'webm';

export type ConvertMediaResult = {
	save: () => Promise<File>;
	remove: () => Promise<void>;
};

export const convertMedia = async ({
	src,
	onVideoFrame,
	onMediaStateUpdate,
	audioCodec,
	to,
	videoCodec,
	signal: userPassedAbortSignal,
	onAudioTrack: userAudioResolver,
	onVideoTrack: userVideoResolver,
}: {
	src: string | File;
	to: ConvertMediaTo;
	onVideoFrame?: (inputFrame: VideoFrame, track: VideoTrack) => Promise<void>;
	onMediaStateUpdate?: (state: ConvertMediaState) => void;
	videoCodec: ConvertMediaVideoCodec;
	audioCodec: ConvertMediaAudioCodec;
	signal?: AbortSignal;
	onAudioTrack?: ResolveAudioActionFn;
	onVideoTrack?: ResolveVideoActionFn;
}): Promise<ConvertMediaResult> => {
	if (to !== 'webm') {
		return Promise.reject(
			new TypeError('Only `to: "webm"` is supported currently'),
		);
	}

	if (audioCodec !== 'opus') {
		return Promise.reject(
			new TypeError('Only `audioCodec: "opus"` is supported currently'),
		);
	}

	if (videoCodec !== 'vp8') {
		return Promise.reject(
			new TypeError('Only `videoCodec: "vp8"` is supported currently'),
		);
	}

	const {promise, resolve, reject} = withResolvers<ConvertMediaResult>();
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
	};

	const canUseWebFs = await canUseWebFsWriter();

	const state = await MediaParserInternals.createMedia(
		canUseWebFs ? webFsWriter : bufferWriter,
	);

	const onVideoTrack: OnVideoTrack = makeVideoTrackHandler({
		state,
		onVideoFrame: onVideoFrame ?? null,
		onMediaStateUpdate: onMediaStateUpdate ?? null,
		abortConversion,
		convertMediaState,
		controller,
		videoCodec,
		onVideoTrack: userVideoResolver ?? defaultResolveVideoAction,
	});

	const onAudioTrack: OnAudioTrack = makeAudioTrackHandler({
		abortConversion,
		audioCodec,
		controller,
		convertMediaState,
		onMediaStateUpdate: onMediaStateUpdate ?? null,
		state,
		onAudioTrack: userAudioResolver ?? defaultResolveAudioAction,
		bitrate: 128000,
	});

	parseMedia({
		src,
		onVideoTrack,
		onAudioTrack,
		signal: controller.signal,
	})
		.then(() => {
			return state.waitForFinish();
		})
		.then(() => {
			resolve({save: state.save, remove: state.remove});
		})
		.catch((err) => {
			reject(err);
		})
		.finally(() => {
			userPassedAbortSignal?.removeEventListener('abort', onUserAbort);
		});

	return promise;
};
