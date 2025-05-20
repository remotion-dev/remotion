import type {
	MediaParserLogLevel,
	MediaParserOnVideoSample,
	MediaParserVideoTrack,
} from '@remotion/media-parser';
import {arrayBufferToUint8Array} from './arraybuffer-to-uint8-array';
import {convertEncodedChunk} from './convert-encoded-chunk';
import type {ConvertMediaOnVideoFrame} from './convert-media';
import type {MediaFn} from './create/media-fn';
import type {ProgressTracker} from './create/progress-tracker';
import {Log} from './log';
import {onFrame} from './on-frame';
import type {VideoOperation} from './on-video-track-handler';
import {processingQueue} from './processing-queue';
import {calculateNewDimensionsFromRotateAndScale} from './rotation';
import {videoFrameSorter} from './sort-video-frames';
import type {ConvertMediaProgressFn} from './throttled-state-update';
import {createVideoDecoder} from './video-decoder';
import {getVideoDecoderConfigWithHardwareAcceleration} from './video-decoder-config';
import {createVideoEncoder} from './video-encoder';
import {getVideoEncoderConfig} from './video-encoder-config';
import type {WebCodecsController} from './webcodecs-controller';

export const reencodeVideoTrack = async ({
	videoOperation,
	rotate,
	track,
	logLevel,
	abortConversion,
	onMediaStateUpdate,
	controller,
	onVideoFrame,
	state,
	progress,
}: {
	videoOperation: VideoOperation;
	rotate: number;
	track: MediaParserVideoTrack;
	logLevel: MediaParserLogLevel;
	abortConversion: (errCause: Error) => void;
	onMediaStateUpdate: null | ConvertMediaProgressFn;
	controller: WebCodecsController;
	onVideoFrame: ConvertMediaOnVideoFrame | null;
	state: MediaFn;
	progress: ProgressTracker;
}): Promise<MediaParserOnVideoSample | null> => {
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

	Log.verbose(logLevel, 'Video encoder config', videoEncoderConfig);
	Log.verbose(logLevel, 'Video decoder config', videoDecoderConfig ?? track);

	if (videoEncoderConfig === null) {
		abortConversion(
			new Error(`Could not configure video encoder of track ${track.trackId}`),
		);
		return null;
	}

	if (videoDecoderConfig === null) {
		abortConversion(
			new Error(`Could not configure video decoder of track ${track.trackId}`),
		);
		return null;
	}

	const {trackNumber} = await state.addTrack({
		type: 'video',
		color: track.advancedColor,
		width: newWidth,
		height: newHeight,
		codec: videoOperation.videoCodec,
		codecPrivate: null,
		timescale: track.originalTimescale,
	});
	Log.verbose(
		logLevel,
		`Created new video track with ID ${trackNumber}, codec ${videoOperation.videoCodec} and timescale ${track.originalTimescale}`,
	);

	const videoEncoder = createVideoEncoder({
		onChunk: async (chunk, metadata) => {
			await state.addSample({
				chunk: convertEncodedChunk(chunk),
				trackNumber,
				isVideo: true,
				codecPrivate: arrayBufferToUint8Array(
					(metadata?.decoderConfig?.description ?? null) as ArrayBuffer | null,
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
		keyframeInterval: 40,
	});

	const videoProcessingQueue = processingQueue<VideoFrame>({
		controller,
		label: 'VideoFrame processing queue',
		logLevel,
		onError: (err) => {
			abortConversion(
				new Error(
					`VideoFrame processing queue of track ${track.trackId} failed (see .cause of this error)`,
					{
						cause: err,
					},
				),
			);
		},
		onOutput: async (frame) => {
			await controller._internals._mediaParserController._internals.checkForAbortAndPause();

			const {frame: fixedFrame, cleanup} = await onFrame({
				frame,
				track,
				onVideoFrame,
				outputCodec: videoOperation.videoCodec,
				rotation,
				resizeOperation: videoOperation.resize ?? null,
			});

			progress.setPossibleLowestTimestamp(frame.timestamp);

			await controller._internals._mediaParserController._internals.checkForAbortAndPause();
			await videoEncoder.ioSynchronizer.waitForQueueSize(10);

			await controller._internals._mediaParserController._internals.checkForAbortAndPause();
			await progress.waitForMinimumProgress(frame.timestamp - 10_000_000);

			await controller._internals._mediaParserController._internals.checkForAbortAndPause();
			videoEncoder.encode(fixedFrame);

			cleanup();
		},
	});

	const frameSorter = videoFrameSorter({
		controller,
		onOutput: async (frame) => {
			await controller._internals._mediaParserController._internals.checkForAbortAndPause();
			await videoProcessingQueue.ioSynchronizer.waitForQueueSize(10);

			videoProcessingQueue.input(frame);
		},
	});

	const videoDecoder = createVideoDecoder({
		config: videoDecoderConfig,
		onFrame: async (frame) => {
			await frameSorter.waitUntilProcessed();
			frameSorter.inputFrame(frame);
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
	});

	state.addWaitForFinishPromise(async () => {
		Log.verbose(logLevel, 'Waiting for video decoder to finish');
		await frameSorter.flush();
		Log.verbose(logLevel, 'Frame sorter flushed');
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
		progress.setPossibleLowestTimestamp(chunk.timestamp);
		await progress.waitForMinimumProgress(chunk.timestamp - 10_000_000);

		await controller._internals._mediaParserController._internals.checkForAbortAndPause();

		await videoDecoder.ioSynchronizer.waitForQueueSize(20);

		if (chunk.type === 'key') {
			await videoDecoder.flush();
		}

		videoDecoder.decode(chunk);
	};
};
