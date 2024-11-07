import type {LogLevel} from '@remotion/media-parser';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';

export type WebCodecsVideoEncoder = {
	encodeFrame: (videoFrame: VideoFrame) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
};

export const createVideoEncoder = ({
	onChunk,
	onError,
	signal,
	config,
	logLevel,
}: {
	onChunk: (chunk: EncodedVideoChunk) => Promise<void>;
	onError: (error: DOMException) => void;
	signal: AbortSignal;
	config: VideoEncoderConfig;
	logLevel: LogLevel;
}): WebCodecsVideoEncoder => {
	if (signal.aborted) {
		throw new Error('Not creating video encoder, already aborted');
	}

	const ioSynchronizer = makeIoSynchronizer(logLevel, 'Video encoder');

	let outputQueue = Promise.resolve();

	const encoder = new VideoEncoder({
		error(error) {
			onError(error);
		},
		output(chunk) {
			if (chunk.duration === null) {
				throw new Error('Duration is null');
			}

			const timestamp = chunk.timestamp + chunk.duration;

			ioSynchronizer.onOutput(timestamp);

			outputQueue = outputQueue
				.then(() => {
					return onChunk(chunk);
				})
				.then(() => {
					ioSynchronizer.onProcessed();
					return Promise.resolve();
				});
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		signal.removeEventListener('abort', onAbort);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.close();
	};

	const onAbort = () => {
		close();
	};

	signal.addEventListener('abort', onAbort);

	encoder.configure(config);

	let framesProcessed = 0;

	const encodeFrame = async (frame: VideoFrame) => {
		if (encoder.state === 'closed') {
			return;
		}

		while (ioSynchronizer.getUnemittedKeyframes() > 1) {
			await ioSynchronizer.waitForOutput();
		}

		// @ts-expect-error - can have changed in the meanwhile
		if (encoder.state === 'closed') {
			return;
		}

		const keyFrame = framesProcessed % 40 === 0;
		encoder.encode(frame, {
			keyFrame,
		});

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
			await ioSynchronizer.waitForFinish();
		},
		close,
		flush: async () => {
			await encoder.flush();
		},
	};
};
