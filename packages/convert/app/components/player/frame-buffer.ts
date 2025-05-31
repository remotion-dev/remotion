import {WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {makeBufferQueue} from './buffer-queue';
import {makePlaybackState} from './playback-state';

export const makeFrameBuffer = ({
	drawFrame,
	initialLoop,
}: {
	drawFrame: (frame: VideoFrame) => void;
	initialLoop: boolean;
}) => {
	let currentlyDrawnFrame: VideoFrame | null = null;
	let lastTimestampOfVideo: number | null = null;
	const isLooping = initialLoop;

	const playback = makePlaybackState();
	const bufferQueue = makeBufferQueue(() => {
		playback.emitter.dispatchQueueChanged();
	});

	const releaseFrame = (frame: VideoFrame) => {
		if (currentlyDrawnFrame) {
			currentlyDrawnFrame.close();
		}

		drawFrame(frame);
		currentlyDrawnFrame = frame;
		playback.setCurrentTime(frame.timestamp);
	};

	const tryToDraw = (): boolean => {
		const shifted = bufferQueue.shift();
		if (shifted) {
			releaseFrame(shifted);
			if (shifted.timestamp === lastTimestampOfVideo) {
				if (!isLooping) {
					playback.pause();
					return true;
				}

				playback.setCurrentTime(0);
			}
		}

		return false;
	};

	const loop = () => {
		const nextFrame = bufferQueue.getNextFrame();

		return setTimeout(
			() => {
				if (!playback.isPlaying()) {
					return;
				}

				const stop = tryToDraw();
				if (stop) {
					return;
				}

				loop();
			},
			(nextFrame.timestamp - playback.getCurrentTime()) / 1000,
		);
	};

	const processSeekWithQueue = (seek: number) => {
		const timestamp = seek * WEBCODECS_TIMESCALE;
		const canProcess = bufferQueue.canProcessSeekWithQueue(
			timestamp,
			currentlyDrawnFrame?.timestamp ?? null,
		);
		if (canProcess) {
			const returnedFrames = bufferQueue.processSeekWithQueue(timestamp);
			const toDraw = returnedFrames.pop();
			for (const frame of returnedFrames) {
				frame.close();
			}

			if (toDraw) {
				drawFrame(toDraw);
			}

			return true;
		}

		return false;
	};

	return {
		getBufferedTimestamps: () => bufferQueue.getBufferedTimestamps(),
		getBufferedFrames: () => bufferQueue.getLength(),
		waitForQueueToBeLessThan: (n: number) => {
			return bufferQueue.waitForQueueToBeLessThan(n);
		},
		clearBecauseOfSeek: () => {
			bufferQueue.clearBecauseOfSeek();
		},
		addFrame: (frame: VideoFrame) => {
			if (
				!currentlyDrawnFrame ||
				Math.abs(currentlyDrawnFrame.timestamp - playback.getCurrentTime()) >
					Math.abs(frame.timestamp - playback.getCurrentTime())
			) {
				releaseFrame(frame);
				return;
			}

			bufferQueue.add(frame);
		},
		play: () => {
			const timeout = loop();
			playback.play(timeout);
		},
		pause: () => {
			playback.pause();
		},
		setLastFrameReceived: () => {
			const lastFrame = bufferQueue.getLastFrame();
			lastTimestampOfVideo = lastFrame.timestamp;
		},
		processSeekWithQueue,
		playback,
	};
};
