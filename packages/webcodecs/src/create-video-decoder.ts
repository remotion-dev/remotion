import type {MediaParserLogLevel} from '@remotion/media-parser';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {Log} from './log';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoDecoder = {
	decode: (videoSample: EncodedVideoChunkInit | EncodedVideoChunk) => void;
	close: () => void;
	flush: () => Promise<void>;
	waitForFinish: () => Promise<void>;
	waitForQueueToBeLessThan: (items: number) => Promise<void>;
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

	const decode = (sample: EncodedVideoChunkInit | EncodedVideoChunk) => {
		if (videoDecoder.state === 'closed') {
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
		waitForFinish: async () => {
			await videoDecoder.flush();
			Log.verbose(logLevel, 'Flushed video decoder');
			await ioSynchronizer.waitForFinish();
			Log.verbose(logLevel, 'IO synchro finished');
		},
		close,
		flush: async () => {
			await videoDecoder.flush();
		},
		waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
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
