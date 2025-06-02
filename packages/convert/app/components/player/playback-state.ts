import type {FrameDatabase} from './frame-database';
import {PlayerEmitter} from './player-event-emitter';

export const makePlaybackState = (
	frameDatabase: FrameDatabase,
	tryToDraw: (frame: VideoFrame) => boolean,
) => {
	let currentTime = 0;
	let playing = false;
	let playTimeout: NodeJS.Timeout | null = null;
	const emitter = new PlayerEmitter();

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

	const loop = () => {
		const nextFrame =
			frameDatabase.getNextFrameForTimestampAndDiscardEarlier(currentTime);

		return setTimeout(
			() => {
				if (!isPlaying()) {
					return;
				}

				const stop = tryToDraw(nextFrame);
				if (stop) {
					return;
				}

				setCurrentTime(nextFrame.timestamp);

				loop();
			},
			(nextFrame.timestamp - getCurrentTime()) / 1000,
		);
	};

	const drawImmediately = () => {
		const nextFrame =
			frameDatabase.getNextFrameForTimestampAndDiscardEarlier(currentTime);

		tryToDraw(nextFrame);
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
	};
};
