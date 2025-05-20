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
	processSample: (videoSample: MediaParserVideoSample) => void;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
	ioSynchronizer: IoSynchronizer;
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

	const processSample = (sample: MediaParserVideoSample) => {
		if (videoDecoder.state === 'closed') {
			return;
		}

		// @ts-expect-error - can have changed in the meanwhile
		if (videoDecoder.state === 'closed') {
			return;
		}

		// Don't flush here.
		// We manually keep track of the memory with the IO synchornizer.

		// Example of flushing breaking things:
		// IMG_2310.MOV has B-frames, and if we flush on a keyframe, we discard some frames that are yet to come.

		videoDecoder.decode(new EncodedVideoChunk(sample));

		ioSynchronizer.inputItem(sample.timestamp);
	};

	return {
		processSample: (sample: MediaParserVideoSample) => {
			processSample(sample);
		},
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
