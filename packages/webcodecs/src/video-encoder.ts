import {MediaParserAbortError, type LogLevel} from '@remotion/media-parser';
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
	onError: (error: DOMException) => void;
	controller: WebCodecsController;
	config: VideoEncoderConfig;
	logLevel: LogLevel;
	outputCodec: ConvertMediaVideoCodec;
	progress: ProgressTracker;
}): WebCodecsVideoEncoder => {
	if (controller._internals.signal.aborted) {
		throw new MediaParserAbortError(
			'Not creating video encoder, already aborted',
		);
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video encoder',
		progress,
	});

	let outputQueue = Promise.resolve();

	const encoder = new VideoEncoder({
		error(error) {
			onError(error);
		},
		output(chunk, metadata) {
			const timestamp = chunk.timestamp + (chunk.duration ?? 0);

			ioSynchronizer.onOutput(timestamp);

			outputQueue = outputQueue
				.then(() => {
					if (controller._internals.signal.aborted) {
						return;
					}

					return onChunk(chunk, metadata ?? null);
				})
				.then(() => {
					ioSynchronizer.onProcessed();
					return Promise.resolve();
				})
				.catch((err) => {
					onError(err);
				});
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		controller._internals.signal.removeEventListener('abort', onAbort);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller._internals.signal.addEventListener('abort', onAbort);

	Log.verbose(logLevel, 'Configuring video encoder', config);
	encoder.configure(config);

	let framesProcessed = 0;

	const encodeFrame = async (frame: VideoFrame) => {
		if (encoder.state === 'closed') {
			return;
		}

		progress.setPossibleLowestTimestamp(frame.timestamp);

		await ioSynchronizer.waitFor({
			// Firefox stalls if too few frames are passed
			unemitted: 10,
			unprocessed: 10,
			minimumProgress: frame.timestamp - 10_000_000,
			controller,
		});

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

		ioSynchronizer.inputItem(frame.timestamp, keyFrame);

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
			await outputQueue;
			await ioSynchronizer.waitForFinish(controller);
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
	};
};
