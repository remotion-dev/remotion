import type {LogLevel, VideoSample} from '@remotion/media-parser';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';

export type WebCodecsVideoDecoder = {
	processSample: (videoSample: VideoSample) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
};

export const createVideoDecoder = ({
	onFrame,
	onError,
	signal,
	config,
	logLevel,
}: {
	onFrame: (frame: VideoFrame) => Promise<void>;
	onError: (error: DOMException) => void;
	signal: AbortSignal;
	config: VideoDecoderConfig;
	logLevel: LogLevel;
}): WebCodecsVideoDecoder => {
	const ioSynchronizer = makeIoSynchronizer(logLevel, 'Video decoder');
	let outputQueue = Promise.resolve();

	const videoDecoder = new VideoDecoder({
		output(inputFrame) {
			ioSynchronizer.onOutput(inputFrame.timestamp);

			const abortHandler = () => {
				inputFrame.close();
			};

			signal.addEventListener('abort', abortHandler, {once: true});

			outputQueue = outputQueue
				.then(() => {
					if (signal.aborted) {
						return;
					}

					return onFrame(inputFrame);
				})
				.then(() => {
					ioSynchronizer.onProcessed();
					signal.removeEventListener('abort', abortHandler);
					return Promise.resolve();
				})
				.catch((err) => {
					inputFrame.close();
					onError(err);
				});
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		signal.removeEventListener('abort', onAbort);
		if (videoDecoder.state === 'closed') {
			return;
		}

		videoDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	signal.addEventListener('abort', onAbort);

	videoDecoder.configure(config);

	const waitForFinish = async () => {
		while (ioSynchronizer.getUnemittedKeyframes() > 1) {
			await ioSynchronizer.waitForOutput();
		}
	};

	const processSample = async (sample: VideoSample) => {
		if (videoDecoder.state === 'closed') {
			return;
		}

		// @ts-expect-error - can have changed in the meanwhile
		if (videoDecoder.state === 'closed') {
			return;
		}

		if (sample.type === 'key') {
			await videoDecoder.flush();
		}

		videoDecoder.decode(new EncodedVideoChunk(sample));

		ioSynchronizer.inputItem(sample.timestamp, sample.type === 'key');
	};

	let inputQueue = Promise.resolve();

	return {
		processSample: (sample: VideoSample) => {
			inputQueue = inputQueue.then(() => processSample(sample));
			return inputQueue;
		},
		waitForFinish: async () => {
			await videoDecoder.flush();
			await waitForFinish();
			await outputQueue;
			await inputQueue;
		},
		close,
		flush: async () => {
			await videoDecoder.flush();
		},
	};
};
