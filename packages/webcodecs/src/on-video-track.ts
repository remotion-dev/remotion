import type {MediaFn, OnVideoTrack, VideoTrack} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './codec-id';
import {codecNameToMatroskaCodecId} from './codec-id';
import type {ConvertMediaState} from './convert-media';
import Error from './error-cause';
import {resolveVideoAction} from './resolve-video-action';
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
		convertMediaState,
		controller,
		videoCodec,
	}: {
		state: MediaFn;
		onVideoFrame:
			| null
			| ((frame: VideoFrame, track: VideoTrack) => Promise<void>);
		onMediaStateUpdate: null | ((state: ConvertMediaState) => void);
		abortConversion: (errCause: Error) => void;
		convertMediaState: ConvertMediaState;
		controller: AbortController;
		videoCodec: ConvertMediaVideoCodec;
	}): OnVideoTrack =>
	async (track) => {
		const videoEncoderConfig = await getVideoEncoderConfig({
			codec: 'vp8',
			height: track.displayAspectHeight,
			width: track.displayAspectWidth,
		});
		const videoDecoderConfig =
			await getVideoDecoderConfigWithHardwareAcceleration(track);
		const videoOperation = await resolveVideoAction({
			videoDecoderConfig,
			videoEncoderConfig,
		});

		if (videoOperation === 'drop') {
			return null;
		}

		if (videoOperation === 'copy') {
			const videoTrack = await state.addTrack({
				type: 'video',
				// TODO: Copy over colors, CodecPrivate...
				color: {
					transferCharacteristics: 'bt709',
					matrixCoefficients: 'bt709',
					primaries: 'bt709',
					fullRange: true,
				},
				width: track.codedWidth,
				height: track.codedHeight,
				codecId: track.codec,
				codecPrivate: track.codecPrivate,
			});
			return (sample) => {
				state.addSample(new EncodedVideoChunk(sample), videoTrack.trackNumber);
				convertMediaState.decodedVideoFrames++;
				onMediaStateUpdate?.({...convertMediaState});
			};
		}

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
				transferCharacteristics: 'bt709',
				matrixCoefficients: 'bt709',
				primaries: 'bt709',
				fullRange: true,
			},
			width: track.codedWidth,
			height: track.codedHeight,
			codecId: codecNameToMatroskaCodecId(videoCodec),
			codecPrivate: null,
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

		const videoDecoder = createVideoDecoder({
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
