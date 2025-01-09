import type {AudioOrVideoSample, LogLevel} from '@remotion/media-parser';
import type {ProgressTracker} from './create/progress-tracker';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {Log} from './log';

export type WebCodecsVideoDecoder = {
	processSample: (videoSample: AudioOrVideoSample) => Promise<void>;
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
	progress,
}: {
	onFrame: (frame: VideoFrame) => Promise<void>;
	onError: (error: DOMException) => void;
	signal: AbortSignal;
	config: VideoDecoderConfig;
	logLevel: LogLevel;
	progress: ProgressTracker;
}): WebCodecsVideoDecoder => {
	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video decoder',
		progress,
	});
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

	const processSample = async (sample: AudioOrVideoSample) => {
		if (videoDecoder.state === 'closed') {
			return;
		}

		// @ts-expect-error - can have changed in the meanwhile
		if (videoDecoder.state === 'closed') {
			return;
		}

		progress.setPossibleLowestTimestamp(
			Math.min(
				sample.timestamp,
				sample.dts ?? Infinity,
				sample.cts ?? Infinity,
			),
		);

		await ioSynchronizer.waitFor({
			unemitted: 20,
			unprocessed: 2,
			minimumProgress: sample.timestamp - 10_000_000,
			signal,
		});
		if (sample.type === 'key') {
			await videoDecoder.flush();
		}

		videoDecoder.decode(new EncodedVideoChunk(sample));

		ioSynchronizer.inputItem(sample.timestamp, sample.type === 'key');
	};

	let inputQueue = Promise.resolve();

	return {
		processSample: (sample: AudioOrVideoSample) => {
			inputQueue = inputQueue.then(() => processSample(sample));
			return inputQueue;
		},
		waitForFinish: async () => {
			await videoDecoder.flush();
			Log.verbose(logLevel, 'Flushed video decoder');
			await ioSynchronizer.waitForFinish(signal);
			Log.verbose(logLevel, 'IO synchro finished');
			await outputQueue;
			Log.verbose(logLevel, 'Output queue finished');
			await inputQueue;
			Log.verbose(logLevel, 'Input queue finished');
		},
		close,
		flush: async () => {
			await videoDecoder.flush();
		},
	};
};
