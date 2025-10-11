import type {WebCodecsController} from './webcodecs-controller';

const MAX_QUEUE_SIZE = 5;

export const videoFrameSorter = ({
	controller,
	onOutput,
}: {
	controller: WebCodecsController;
	onOutput: (frame: VideoFrame) => Promise<void>;
}) => {
	const frames: VideoFrame[] = [];

	const releaseFrame = async () => {
		await controller._internals._mediaParserController._internals.checkForAbortAndPause();

		const frame = frames.shift();
		if (frame) {
			await onOutput(frame);
		}
	};

	const sortFrames = () => {
		frames.sort((a, b) => a.timestamp - b.timestamp);
	};

	const releaseIfQueueFull = async () => {
		if (frames.length >= MAX_QUEUE_SIZE) {
			sortFrames();
			await releaseFrame();
		}
	};

	const addFrame = (frame: VideoFrame) => {
		frames.push(frame);
	};

	const inputFrame = async (frame: VideoFrame) => {
		addFrame(frame);
		await releaseIfQueueFull();
	};

	const onAbort = () => {
		while (frames.length > 0) {
			const frame = frames.shift();
			if (frame) {
				frame.close();
			}
		}

		frames.length = 0;
	};

	const flush = async () => {
		sortFrames();
		while (frames.length > 0) {
			await releaseFrame();
		}

		controller._internals._mediaParserController._internals.signal.removeEventListener(
			'abort',
			onAbort,
		);
	};

	controller._internals._mediaParserController._internals.signal.addEventListener(
		'abort',
		onAbort,
	);

	let promise = Promise.resolve();

	return {
		inputFrame: (frame: VideoFrame) => {
			promise = promise.then(() => inputFrame(frame));
		},
		waitUntilProcessed: () => promise,
		flush,
	};
};
