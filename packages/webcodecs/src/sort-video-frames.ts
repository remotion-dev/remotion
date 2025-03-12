import type {WebCodecsController} from './webcodecs-controller';

const MAX_QUEUE_SIZE = 5;

export const videoFrameSorter = ({
	onRelease,
	controller,
}: {
	onRelease: (frame: VideoFrame) => Promise<void>;
	controller: WebCodecsController;
}) => {
	const frames: VideoFrame[] = [];

	const releaseFrame = async () => {
		await controller._internals.checkForAbortAndPause();

		const frame = frames.shift();
		if (frame) {
			await onRelease(frame);
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

		controller._internals.signal.removeEventListener('abort', onAbort);
	};

	controller._internals.signal.addEventListener('abort', onAbort);

	return {
		inputFrame,
		flush,
	};
};
