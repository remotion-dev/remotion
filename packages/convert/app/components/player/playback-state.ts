import type {FrameDatabase} from './frame-database';
import {PlayerEmitter} from './player-event-emitter';

export const makePlaybackState = ({
	frameDatabase,
	drawFrame,
}: {
	frameDatabase: FrameDatabase;
	drawFrame: (frame: VideoFrame) => void;
}) => {
	let currentTime = 0;
	let playing = false;
	let playTimeout: NodeJS.Timeout | null = null;
	const emitter = new PlayerEmitter();
	let lastFrameDrawn: number | null = null;

	const clearPlayTimeout = () => {
		if (playTimeout) {
			clearTimeout(playTimeout);
		}
	};

	const getCurrentTime = () => {
		return currentTime;
	};

	const isPlaying = () => {
		return playing;
	};

	const setCurrentTime = (time: number) => {
		const hasChanged = currentTime !== time;
		currentTime = time;
		if (hasChanged) {
			emitter.dispatchTimeUpdate(time);
		}
	};

	const emitFrame = (frame: VideoFrame) => {
		if (lastFrameDrawn === frame.timestamp) {
			return;
		}

		lastFrameDrawn = frame.timestamp;
		drawFrame(frame);
	};

	const loop = () => {
		const nextFrame = frameDatabase.getNextFrameForTimestamp(currentTime, true);
		if (!nextFrame) {
			throw new Error('No frame found for time');
		}

		return setTimeout(
			() => {
				if (!isPlaying()) {
					return;
				}

				emitFrame(nextFrame.frame);
				setCurrentTime(nextFrame.frame.timestamp);
				nextFrame.frame.close();

				loop();
			},
			(nextFrame.frame.timestamp - getCurrentTime()) / 1000,
		);
	};

	const drawImmediately = () => {
		const nextFrame = frameDatabase.getNextFrameForTimestamp(
			currentTime,
			false,
		);

		if (!nextFrame) {
			return;
		}

		emitFrame(nextFrame.frame);
	};

	const pause = () => {
		playing = false;
		clearPlayTimeout();
		emitter.dispatchPause();
	};

	const play = () => {
		playing = true;
		playTimeout = loop();
		emitter.dispatchPlay();
	};

	return {
		setCurrentTime,
		getCurrentTime,
		isPlaying,
		pause,
		play,
		emitter,
		drawImmediately,
		getCurrentlyDrawnFrame: () => {
			return lastFrameDrawn;
		},
	};
};
