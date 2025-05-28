import {makeBufferQueue} from './buffer-queue';
import {makePlaybackState} from './playback-state';

export const makeFrameBuffer = ({
	drawFrame,
}: {
	drawFrame: (frame: VideoFrame) => void;
}) => {
	let currentlyDrawnFrame: VideoFrame | null = null;
	let lastTimestampOfVideo: number | null = null;

	const playback = makePlaybackState();
	const bufferQueue = makeBufferQueue();

	const releaseFrame = (frame: VideoFrame) => {
		if (currentlyDrawnFrame) {
			currentlyDrawnFrame.close();
		}

		drawFrame(frame);
		currentlyDrawnFrame = frame;
		playback.setCurrentTime(frame.timestamp);
	};

	const loop = () => {
		const nextFrame = bufferQueue.getNextFrame();

		return setTimeout(
			() => {
				if (!playback.isPlaying()) {
					return;
				}

				const shifted = bufferQueue.shift();
				if (shifted) {
					releaseFrame(shifted);
					if (shifted.timestamp === lastTimestampOfVideo) {
						playback.pause();
						return;
					}
				}

				loop();
			},
			(nextFrame.timestamp - playback.getCurrentTime()) / 1000,
		);
	};

	return {
		getBufferedFrames: () => bufferQueue.getLength(),
		waitForQueueToBeLessThan: (n: number) => {
			return bufferQueue.waitForQueueToBeLessThan(n);
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
		playback,
	};
};
