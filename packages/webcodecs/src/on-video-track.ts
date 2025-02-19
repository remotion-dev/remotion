import type {LogLevel, OnVideoTrack} from '@remotion/media-parser';
import {arrayBufferToUint8Array} from './arraybuffer-to-uint8-array';
import {canCopyVideoTrack} from './can-copy-video-track';
import {convertEncodedChunk} from './convert-encoded-chunk';
import type {ConvertMediaOnVideoFrame} from './convert-media';
import type {MediaFn} from './create/media-fn';
import type {ProgressTracker} from './create/progress-tracker';
import {defaultOnVideoTrackHandler} from './default-on-video-track-handler';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {getDefaultVideoCodec} from './get-default-video-codec';
import {Log} from './log';
import {onFrame} from './on-frame';
import type {ConvertMediaOnVideoTrackHandler} from './on-video-track-handler';
import type {ResizeOperation} from './resizing/mode';
import {calculateNewDimensionsFromRotateAndScale} from './rotation';
import type {ConvertMediaProgressFn} from './throttled-state-update';
import {createVideoDecoder} from './video-decoder';
import {getVideoDecoderConfigWithHardwareAcceleration} from './video-decoder-config';
import {createVideoEncoder} from './video-encoder';
import {getVideoEncoderConfig} from './video-encoder-config';
import type {WebCodecsController} from './webcodecs-controller';

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
		outputContainer,
		rotate,
		progress,
		resizeOperation,
	}: {
		state: MediaFn;
		onVideoFrame: null | ConvertMediaOnVideoFrame;
		onMediaStateUpdate: null | ConvertMediaProgressFn;
		abortConversion: (errCause: Error) => void;
		controller: WebCodecsController;
		defaultVideoCodec: ConvertMediaVideoCodec | null;
		onVideoTrack: ConvertMediaOnVideoTrackHandler | null;
		logLevel: LogLevel;
		outputContainer: ConvertMediaContainer;
		rotate: number;
		progress: ProgressTracker;
		resizeOperation: ResizeOperation | null;
	}): OnVideoTrack =>
	async ({track, container: inputContainer}) => {
		if (controller._internals.signal.aborted) {
			throw new Error('Aborted');
		}

		const canCopyTrack = canCopyVideoTrack({
			inputContainer,
			outputContainer,
			rotationToApply: rotate,
			inputTrack: track,
			resizeOperation,
		});

		const videoOperation = await (onVideoTrack ?? defaultOnVideoTrackHandler)({
			track,
			defaultVideoCodec:
				defaultVideoCodec ?? getDefaultVideoCodec({container: outputContainer}),
			logLevel,
			outputContainer,
			rotate,
			inputContainer,
			canCopyTrack,
			resizeOperation,
		});

		if (videoOperation.type === 'drop') {
			return null;
		}

		if (videoOperation.type === 'fail') {
			throw new Error(
				`Video track with ID ${track.trackId} resolved with {"type": "fail"}. This could mean that this video track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`,
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

		if (videoOperation.type !== 'reencode') {
			throw new Error(
				`Video track with ID ${track.trackId} could not be resolved with a valid operation. Received ${JSON.stringify(
					videoOperation,
				)}, but must be either "copy", "reencode", "drop" or "fail"`,
			);
		}

		const rotation = (videoOperation.rotate ?? rotate) - track.rotation;

		const {height: newHeight, width: newWidth} =
			calculateNewDimensionsFromRotateAndScale({
				width: track.codedWidth,
				height: track.codedHeight,
				rotation,
				videoCodec: videoOperation.videoCodec,
				resizeOperation: videoOperation.resize ?? null,
			});

		const videoEncoderConfig = await getVideoEncoderConfig({
			codec: videoOperation.videoCodec,
			height: newHeight,
			width: newWidth,
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
			width: newWidth,
			height: newHeight,
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
			controller,
			config: videoEncoderConfig,
			logLevel,
			outputCodec: videoOperation.videoCodec,
			progress,
		});

		const videoDecoder = createVideoDecoder({
			config: videoDecoderConfig,
			onFrame: async (frame) => {
				await onFrame({
					frame,
					track,
					videoEncoder,
					onVideoFrame,
					outputCodec: videoOperation.videoCodec,
					rotation,
					resizeOperation: videoOperation.resize ?? null,
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
			controller,
			logLevel,
			progress,
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
