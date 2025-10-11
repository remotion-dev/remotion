import type {MediaParserLogLevel} from '@remotion/media-parser';
import type {FlushPending} from './flush-pending';
import {makeFlushPending} from './flush-pending';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {VideoUndecodableError} from './undecodable-error';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoDecoder = {
	decode: (
		videoSample: EncodedVideoChunkInit | EncodedVideoChunk,
	) => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	waitForQueueToBeLessThan: (items: number) => Promise<void>;
	reset: () => void;
	checkReset: () => {
		wasReset: () => boolean;
	};
	getMostRecentSampleInput: () => number | null;
};

export const internalCreateVideoDecoder = async ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
}: {
	onFrame: (frame: VideoFrame) => Promise<void> | void;
	onError: (error: Error) => void;
	controller: WebCodecsController | null;
	config: VideoDecoderConfig;
	logLevel: MediaParserLogLevel;
}): Promise<WebCodecsVideoDecoder> => {
	if (
		controller &&
		controller._internals._mediaParserController._internals.signal.aborted
	) {
		throw new Error('Not creating audio decoder, already aborted');
	}

	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video decoder',
		controller,
	});

	let mostRecentSampleReceived: number | null = null;

	const videoDecoder = new VideoDecoder({
		async output(frame) {
			try {
				await onFrame(frame);
			} catch (err) {
				onError(err as Error);
				frame.close();
			}

			ioSynchronizer.onOutput(frame.timestamp);
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		if (controller) {
			controller._internals._mediaParserController._internals.signal.removeEventListener(
				'abort',
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				onAbort,
			);
		}

		if (videoDecoder.state === 'closed') {
			return;
		}

		videoDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	if (controller) {
		controller._internals._mediaParserController._internals.signal.addEventListener(
			'abort',
			onAbort,
		);
	}

	const isConfigSupported = await VideoDecoder.isConfigSupported(config);
	if (!isConfigSupported) {
		throw new VideoUndecodableError({
			message: 'Video cannot be decoded by this browser',
			config,
		});
	}

	videoDecoder.configure(config);

	const decode = async (sample: EncodedVideoChunkInit | EncodedVideoChunk) => {
		if (videoDecoder.state === 'closed') {
			return;
		}

		try {
			await controller?._internals._mediaParserController._internals.checkForAbortAndPause();
		} catch (err) {
			onError(err as Error);
			return;
		}

		mostRecentSampleReceived = sample.timestamp;

		const encodedChunk =
			sample instanceof EncodedVideoChunk
				? sample
				: new EncodedVideoChunk(sample);
		videoDecoder.decode(encodedChunk);
		ioSynchronizer.inputItem(sample.timestamp);
	};

	let flushPending: FlushPending | null = null;
	let lastReset: number | null = null;

	return {
		decode,
		close,
		flush: () => {
			if (flushPending) {
				throw new Error('Flush already pending');
			}

			const pendingFlush = makeFlushPending();
			flushPending = pendingFlush;
			Promise.resolve()
				.then(() => {
					return videoDecoder.flush();
				})
				.catch(() => {
					// Firefox might throw "Needs to be configured first"
				})
				.finally(() => {
					pendingFlush.resolve();
					flushPending = null;
				});

			return pendingFlush.promise;
		},
		waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
		reset: () => {
			lastReset = Date.now();
			flushPending?.resolve();
			ioSynchronizer.clearQueue();
			videoDecoder.reset();
			videoDecoder.configure(config);
		},
		checkReset: () => {
			const initTime = Date.now();
			return {
				wasReset: () => lastReset !== null && lastReset > initTime,
			};
		},
		getMostRecentSampleInput() {
			return mostRecentSampleReceived;
		},
	};
};

export const createVideoDecoder = ({
	onFrame,
	onError,
	controller,
	track,
	logLevel,
}: {
	track: VideoDecoderConfig;
	onFrame: (frame: VideoFrame) => Promise<void> | void;
	onError: (error: Error) => void;
	controller?: WebCodecsController;
	logLevel?: MediaParserLogLevel;
}): Promise<WebCodecsVideoDecoder> => {
	return internalCreateVideoDecoder({
		onFrame,
		onError,
		controller: controller ?? null,
		config: track,
		logLevel: logLevel ?? 'info',
	});
};
