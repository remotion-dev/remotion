import type {MediaParserLogLevel} from '@remotion/media-parser';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoDecoder = {
	decode: (
		videoSample: EncodedVideoChunkInit | EncodedVideoChunk,
	) => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	waitForQueueToBeLessThan: (items: number) => Promise<boolean>;
	reset: () => void;
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

	return {
		decode,
		close,
		flush: async () => {
			// Firefox might throw "Needs to be configured first"
			try {
				await videoDecoder.flush();
			} catch {}

			await ioSynchronizer.waitForQueueSize(0);
		},
		waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
		reset: () => {
			console.log('resetting decoder');
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
