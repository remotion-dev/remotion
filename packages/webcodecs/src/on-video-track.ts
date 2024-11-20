import type {LogLevel, MediaFn, OnVideoTrack} from '@remotion/media-parser';
import {arrayBufferToUint8Array} from './arraybuffer-to-uint8-array';
import type {ConvertMediaContainer, ConvertMediaVideoCodec} from './codec-id';
import {convertEncodedChunk} from './convert-encoded-chunk';
import type {ConvertMediaOnVideoFrame} from './convert-media';
import {defaultOnVideoTrackHandler} from './default-on-video-track-handler';
import Error from './error-cause';
import {Log} from './log';
import {onFrame} from './on-frame';
import type {ConvertMediaOnVideoTrackHandler} from './on-video-track-handler';
import type {ConvertMediaProgressFn} from './throttled-state-update';
import {createVideoDecoder} from './video-decoder';
import {getVideoDecoderConfigWithHardwareAcceleration} from './video-decoder-config';
import {createVideoEncoder} from './video-encoder';
import {getVideoEncoderConfig} from './video-encoder-config';

export const makeVideoTrackHandler =
	({
		state,
		onVideoFrame,
		onMediaStateUpdate,
		abortConversion,
		controller,
		defaultVideoCodec,
		onVideoTrack,
		logLevel,
		container,
	}: {
		state: MediaFn;
		onVideoFrame: null | ConvertMediaOnVideoFrame;
		onMediaStateUpdate: null | ConvertMediaProgressFn;
		abortConversion: (errCause: Error) => void;
		controller: AbortController;
		defaultVideoCodec: ConvertMediaVideoCodec | null;
		onVideoTrack: ConvertMediaOnVideoTrackHandler | null;
		logLevel: LogLevel;
		container: ConvertMediaContainer;
	}): OnVideoTrack =>
	async (track) => {
		if (controller.signal.aborted) {
			throw new Error('Aborted');
		}

		const videoOperation = await (onVideoTrack ?? defaultOnVideoTrackHandler)({
			track,
			defaultVideoCodec,
			logLevel,
			container,
		});

		if (videoOperation.type === 'drop') {
			return null;
		}

		if (videoOperation.type === 'fail') {
			throw new Error(
				`Video track with ID ${track.trackId} could resolved with {"type": "fail"}. This could mean that this video track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`,
			);
		}

		if (videoOperation.type === 'copy') {
			Log.verbose(
				logLevel,
				`Copying video track with codec ${track.codec} and timescale ${track.timescale}`,
			);
			const videoTrack = await state.addTrack({
				type: 'video',
				color: track.color,
				width: track.codedWidth,
				height: track.codedHeight,
				codec: track.codecWithoutConfig,
				codecPrivate: track.codecPrivate,
				timescale: track.timescale,
			});
			return async (sample) => {
				await state.addSample({
					chunk: sample,
					trackNumber: videoTrack.trackNumber,
					isVideo: true,
					timescale: track.timescale,
					codecPrivate: track.codecPrivate,
				});

				onMediaStateUpdate?.((prevState) => {
					return {
						...prevState,
						decodedVideoFrames: prevState.decodedVideoFrames + 1,
					};
				});
			};
		}

		const videoEncoderConfig = await getVideoEncoderConfig({
			codec: videoOperation.videoCodec,
			height: track.displayAspectHeight,
			width: track.displayAspectWidth,
			fps: track.fps,
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
			color: track.color,
			width: track.codedWidth,
			height: track.codedHeight,
			codec: videoOperation.videoCodec,
			codecPrivate: null,
			timescale: track.timescale,
		});
		Log.verbose(
			logLevel,
			`Created new video track with ID ${trackNumber}, codec ${videoOperation.videoCodec} and timescale ${track.timescale}`,
		);

		const videoEncoder = createVideoEncoder({
			onChunk: async (chunk, metadata) => {
				await state.addSample({
					chunk: convertEncodedChunk(chunk, trackNumber),
					trackNumber,
					isVideo: true,
					timescale: track.timescale,
					codecPrivate: arrayBufferToUint8Array(
						(metadata?.decoderConfig?.description ??
							null) as ArrayBuffer | null,
					),
				});
				onMediaStateUpdate?.((prevState) => {
					return {
						...prevState,
						encodedVideoFrames: prevState.encodedVideoFrames + 1,
					};
				});
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
			logLevel,
		});

		const videoDecoder = createVideoDecoder({
			config: videoDecoderConfig,
			onFrame: async (frame) => {
				await onFrame({
					frame,
					onMediaStateUpdate,
					track,
					videoEncoder,
					onVideoFrame,
				});
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
			logLevel,
		});

		state.addWaitForFinishPromise(async () => {
			Log.verbose(logLevel, 'Waiting for video decoder to finish');
			await videoDecoder.waitForFinish();
			videoDecoder.close();
			Log.verbose(
				logLevel,
				'Video decoder finished. Waiting for encoder to finish',
			);
			await videoEncoder.waitForFinish();
			videoEncoder.close();
			Log.verbose(logLevel, 'Encoder finished');
		});

		return async (chunk) => {
			await videoDecoder.processSample(chunk);
		};
	};
