import type {
	MediaParserLogLevel,
	MediaParserVideoSample,
} from '@remotion/media-parser';
import type {IoSynchronizer} from './io-manager/io-synchronizer';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {Log} from './log';
import {videoFrameSorter} from './sort-video-frames';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoDecoder = {
	decode: (videoSample: MediaParserVideoSample) => void;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	ioSynchronizer: IoSynchronizer;
};

export const internalCreateVideoDecoder = ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
}: {
	onFrame: (frame: VideoFrame) => Promise<void>;
	onError: (error: Error) => void;
	controller: WebCodecsController;
	config: VideoDecoderConfig;
	logLevel: MediaParserLogLevel;
}): WebCodecsVideoDecoder => {
	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video decoder',
	});

	const frameSorter = videoFrameSorter({
		controller,
		onRelease: async (frame) => {
			await onFrame(frame);
		},
	});

	const videoDecoder = new VideoDecoder({
		async output(frame) {
			ioSynchronizer.onOutput(frame.timestamp);
			try {
				await frameSorter.inputFrame(frame);
			} catch (err) {
				onError(err as Error);
				frame.close();
			}
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		controller._internals._mediaParserController._internals.signal.removeEventListener(
			'abort',
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			onAbort,
		);
		if (videoDecoder.state === 'closed') {
			return;
		}

		videoDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller._internals._mediaParserController._internals.signal.addEventListener(
		'abort',
		onAbort,
	);

	videoDecoder.configure(config);

	const decode = (sample: MediaParserVideoSample) => {
		if (videoDecoder.state === 'closed') {
			return;
		}

		videoDecoder.decode(new EncodedVideoChunk(sample));
		ioSynchronizer.inputItem(sample.timestamp);
	};

	return {
		decode,
		waitForFinish: async () => {
			await videoDecoder.flush();
			Log.verbose(logLevel, 'Flushed video decoder');
			await frameSorter.flush();
			Log.verbose(logLevel, 'Frame sorter flushed');
			await ioSynchronizer.waitForFinish(controller);
			Log.verbose(logLevel, 'IO synchro finished');
		},
		close,
		flush: async () => {
			await videoDecoder.flush();
		},
		ioSynchronizer,
	};
};

export const createVideoDecoder = ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
}: {
	onFrame: (frame: VideoFrame) => Promise<void>;
	onError: (error: Error) => void;
	controller: WebCodecsController;
	config: VideoDecoderConfig;
	logLevel?: MediaParserLogLevel;
}): WebCodecsVideoDecoder => {
	return internalCreateVideoDecoder({
		onFrame,
		onError,
		controller,
		config,
		logLevel: logLevel ?? 'info',
	});
};
