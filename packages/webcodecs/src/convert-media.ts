import type {OnAudioTrack, VideoTrack} from '@remotion/media-parser';
import {
	MediaParserInternals,
	parseMedia,
	type OnVideoTrack,
} from '@remotion/media-parser';
import {bufferWriter} from '@remotion/media-parser/buffer';
import {canUseWebFsWriter, webFsWriter} from '@remotion/media-parser/web-fs';
import {createAudioDecoder} from './audio-decoder';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {createAudioEncoder} from './audio-encoder';
import {getAudioEncoderConfig} from './audio-encoder-config';
import type {ConvertMediaAudioCodec} from './codec-id';
import {
	codecNameToMatroskaAudioCodecId,
	codecNameToMatroskaCodecId,
	type ConvertMediaVideoCodec,
} from './codec-id';
import Error from './error-cause';
import {createVideoDecoder} from './video-decoder';
import {getVideoDecoderConfigWithHardwareAcceleration} from './video-decoder-config';
import {createVideoEncoder} from './video-encoder';
import {getVideoEncoderConfig} from './video-encoder-config';
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

type AudioMode = 'reencode' | 'copy';
// TODO: Unhardcode
const AUDIO_MODE: AudioMode = 'reencode' as AudioMode;

export const convertMedia = async ({
	src,
	onVideoFrame,
	onMediaStateUpdate,
	audioCodec,
	to,
	videoCodec,
	signal: userPassedAbortSignal,
}: {
	src: string | File;
	onVideoFrame?: (inputFrame: VideoFrame, track: VideoTrack) => Promise<void>;
	onMediaStateUpdate?: (state: ConvertMediaState) => void;
	videoCodec: ConvertMediaVideoCodec;
	audioCodec: ConvertMediaAudioCodec;
	to: ConvertMediaTo;
	signal?: AbortSignal;
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

	const onVideoTrack: OnVideoTrack = async (track) => {
		const videoEncoderConfig = await getVideoEncoderConfig({
			codec: 'vp8',
			height: track.displayAspectHeight,
			width: track.displayAspectWidth,
		});
		const videoDecoderConfig =
			await getVideoDecoderConfigWithHardwareAcceleration(track);

		if (videoEncoderConfig === null) {
			abortConversion(
				new Error(
					`Could not configure video encoder of track ${track.trackId}`,
				),
			);
			return null;
		}

		if (videoDecoderConfig === null) {
			abortConversion(
				new Error(
					`Could not configure video decoder of track ${track.trackId}`,
				),
			);
			return null;
		}

		const {trackNumber} = await state.addTrack({
			type: 'video',
			color: {
				transferChracteristics: 'bt709',
				matrixCoefficients: 'bt709',
				primaries: 'bt709',
				fullRange: true,
			},
			width: track.codedWidth,
			height: track.codedHeight,
			codecId: codecNameToMatroskaCodecId(videoCodec),
		});

		const videoEncoder = createVideoEncoder({
			onChunk: async (chunk) => {
				await state.addSample(chunk, trackNumber);
				const newDuration = Math.round(
					(chunk.timestamp + (chunk.duration ?? 0)) / 1000,
				);
				await state.updateDuration(newDuration);
				convertMediaState.encodedVideoFrames++;
				onMediaStateUpdate?.({...convertMediaState});
			},
			onError: (err) => {
				abortConversion(
					new Error(
						`Video encoder of track ${track.trackId} failed (see .cause of this error)`,
						{
							cause: err,
						},
					),
				);
			},
			signal: controller.signal,
			config: videoEncoderConfig,
		});

		const videoDecoder = await createVideoDecoder({
			config: videoDecoderConfig,
			onFrame: async (frame) => {
				await onVideoFrame?.(frame, track);
				await videoEncoder.encodeFrame(frame);
				convertMediaState.decodedVideoFrames++;
				onMediaStateUpdate?.({...convertMediaState});
				frame.close();
			},
			onError: (err) => {
				abortConversion(
					new Error(
						`Video decoder of track ${track.trackId} failed (see .cause of this error)`,
						{
							cause: err,
						},
					),
				);
			},
			signal: controller.signal,
		});

		state.addWaitForFinishPromise(async () => {
			await videoDecoder.waitForFinish();
			await videoEncoder.waitForFinish();
			videoDecoder.close();
			videoEncoder.close();
		});

		return async (chunk) => {
			await videoDecoder.processSample(chunk);
		};
	};

	const onAudioTrack: OnAudioTrack = async (track) => {
		const audioEncoderConfig = await getAudioEncoderConfig({
			codec: 'opus',
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			bitrate: 128000,
		});
		const audioDecoderConfig = await getAudioDecoderConfig({
			codec: track.codec,
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			description: track.description,
		});

		if (AUDIO_MODE === 'copy') {
			const addedTrack = await state.addTrack({
				type: 'audio',
				codecId: codecNameToMatroskaAudioCodecId(audioCodec),
				numberOfChannels: track.numberOfChannels,
				sampleRate: track.sampleRate,
				codecPrivate: track.codecPrivate,
			});

			return async (audioSample) => {
				await state.addSample(
					new EncodedAudioChunk(audioSample),
					addedTrack.trackNumber,
				);
				convertMediaState.encodedAudioFrames++;
				onMediaStateUpdate?.({...convertMediaState});
			};
		}

		if (!audioEncoderConfig) {
			abortConversion(
				new Error(
					`Could not configure audio encoder of track ${track.trackId}`,
				),
			);
			return null;
		}

		if (!audioDecoderConfig) {
			abortConversion(
				new Error(
					`Could not configure audio decoder of track ${track.trackId}`,
				),
			);
			return null;
		}

		const {trackNumber} = await state.addTrack({
			type: 'audio',
			codecId: codecNameToMatroskaAudioCodecId(audioCodec),
			numberOfChannels: track.numberOfChannels,
			sampleRate: track.sampleRate,
			codecPrivate: null,
		});

		const audioEncoder = createAudioEncoder({
			onChunk: async (chunk) => {
				await state.addSample(chunk, trackNumber);
				convertMediaState.encodedAudioFrames++;
				onMediaStateUpdate?.({...convertMediaState});
			},
			onError: (err) => {
				abortConversion(
					new Error(
						`Audio encoder of ${track.trackId} failed (see .cause of this error)`,
						{
							cause: err,
						},
					),
				);
			},
			codec: audioCodec,
			signal: controller.signal,
			config: audioEncoderConfig,
		});

		const audioDecoder = await createAudioDecoder({
			onFrame: async (frame) => {
				await audioEncoder.encodeFrame(frame);

				convertMediaState.decodedAudioFrames++;
				onMediaStateUpdate?.(convertMediaState);
				frame.close();
			},
			onError(error) {
				abortConversion(
					new Error(
						`Audio decoder of track ${track.trackId} failed (see .cause of this error)`,
						{
							cause: error,
						},
					),
				);
			},
			signal: controller.signal,
			config: audioDecoderConfig,
		});

		state.addWaitForFinishPromise(async () => {
			await audioDecoder.waitForFinish();
			await audioEncoder.waitForFinish();
			audioDecoder.close();
			audioEncoder.close();
		});

		return async (audioSample) => {
			await audioDecoder.processSample(audioSample);
		};
	};

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
