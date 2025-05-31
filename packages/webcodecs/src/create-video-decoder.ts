import type {MediaParserLogLevel} from '@remotion/media-parser';
import {withResolvers} from './create/with-resolvers';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoDecoder = {
	decode: (
		videoSample: EncodedVideoChunkInit | EncodedVideoChunk,
	) => Promise<void>;
	close: () => void;
	flush: () => Promise<boolean>;
	waitForQueueToBeLessThan: (items: number) => Promise<boolean>;
	reset: () => void;
};

type FlushPending = {
	resolve: (value: boolean | PromiseLike<boolean>) => void;
	reject: (reason?: any) => void;
	promise: Promise<boolean>;
};

const makeFlushPending = () => {
	const {promise, resolve, reject} = withResolvers<boolean>();

	return {
		promise,
		resolve,
		reject,
	};
};

export const internalCreateVideoDecoder = ({
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
}): WebCodecsVideoDecoder => {
	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video decoder',
		controller,
	});

	const videoDecoder = new VideoDecoder({
		async output(frame) {
			console.log('output', frame.timestamp);
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

		const encodedChunk =
			sample instanceof EncodedVideoChunk
				? sample
				: new EncodedVideoChunk(sample);
		videoDecoder.decode(encodedChunk);
		ioSynchronizer.inputItem(sample.timestamp);
	};

	let flushPending: FlushPending | null = null;

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
					pendingFlush.resolve(false);
					flushPending = null;
				});

			return pendingFlush.promise;
		},
		waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
		reset: () => {
			flushPending?.resolve(true);
			ioSynchronizer.clearQueue();
			videoDecoder.reset();
			videoDecoder.configure(config);
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
}): WebCodecsVideoDecoder => {
	return internalCreateVideoDecoder({
		onFrame,
		onError,
		controller: controller ?? null,
		config: track,
		logLevel: logLevel ?? 'info',
	});
};
