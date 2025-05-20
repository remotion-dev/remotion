import {
	MediaParserAbortError,
	type MediaParserLogLevel,
} from '@remotion/media-parser';
import {convertToCorrectVideoFrame} from './convert-to-correct-videoframe';
import type {ProgressTracker} from './create/progress-tracker';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {Log} from './log';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoEncoder = {
	encodeFrame: (videoFrame: VideoFrame, timestamp: number) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
};

export const createVideoEncoder = ({
	onChunk,
	onError,
	controller,
	config,
	logLevel,
	outputCodec,
	progress,
}: {
	onChunk: (
		chunk: EncodedVideoChunk,
		metadata: EncodedVideoChunkMetadata | null,
	) => Promise<void>;
	onError: (error: Error) => void;
	controller: WebCodecsController;
	config: VideoEncoderConfig;
	logLevel: MediaParserLogLevel;
	outputCodec: ConvertMediaVideoCodec;
	progress: ProgressTracker;
}): WebCodecsVideoEncoder => {
	if (controller._internals._mediaParserController._internals.signal.aborted) {
		throw new MediaParserAbortError(
			'Not creating video encoder, already aborted',
		);
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video encoder',
		controller,
	});

	const encoder = new VideoEncoder({
		error(error) {
			onError(error);
		},
		async output(chunk, metadata) {
			const timestamp = chunk.timestamp + (chunk.duration ?? 0);

			ioSynchronizer.onOutput(timestamp);

			try {
				return await onChunk(chunk, metadata ?? null);
			} catch (err) {
				onError(err as Error);
			}
		},
	});

	const close = () => {
		controller._internals._mediaParserController._internals.signal.removeEventListener(
			'abort',
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			onAbort,
		);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller._internals._mediaParserController._internals.signal.addEventListener(
		'abort',
		onAbort,
	);

	Log.verbose(logLevel, 'Configuring video encoder', config);
	encoder.configure(config);

	let framesProcessed = 0;

	const encodeFrame = async (frame: VideoFrame) => {
		if (encoder.state === 'closed') {
			return;
		}

		progress.setPossibleLowestTimestamp(frame.timestamp);

		await controller._internals._mediaParserController._internals.checkForAbortAndPause();
		await ioSynchronizer.waitForQueueSize(10);

		await controller._internals._mediaParserController._internals.checkForAbortAndPause();
		await progress.waitForMinimumProgress(frame.timestamp - 10_000_000);
		await controller._internals._mediaParserController._internals.checkForAbortAndPause();

		// @ts-expect-error - can have changed in the meanwhile
		if (encoder.state === 'closed') {
			return;
		}

		const keyFrame = framesProcessed % 40 === 0;
		encoder.encode(
			convertToCorrectVideoFrame({videoFrame: frame, outputCodec}),
			{
				keyFrame,
				// @ts-expect-error
				vp9: {
					quantizer: 36,
				},
			},
		);

		ioSynchronizer.inputItem(frame.timestamp);

		framesProcessed++;
	};

	let inputQueue = Promise.resolve();

	return {
		encodeFrame: (frame: VideoFrame) => {
			inputQueue = inputQueue.then(() => encodeFrame(frame));
			return inputQueue;
		},
		waitForFinish: async () => {
			await encoder.flush();
			await ioSynchronizer.waitForFinish();
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
	};
};
