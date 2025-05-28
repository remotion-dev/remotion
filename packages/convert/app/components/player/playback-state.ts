import {PlayerEmitter} from './event-emitter';

export const makePlaybackState = () => {
	let currentTime = 0;
	let playing = false;
	let playTimeout: NodeJS.Timeout | null = null;
	const emitter = new PlayerEmitter();

	const clearPlayTimeout = () => {
		if (playTimeout) {
			clearTimeout(playTimeout);
		}
	};

	const setPlayTimeout = (timeout: NodeJS.Timeout) => {
		playTimeout = timeout;
	};

	return {
		setCurrentTime: (time: number) => {
			const hasChanged = currentTime !== time;
			currentTime = time;
			if (hasChanged) {
				emitter.dispatchTimeUpdate(time);
			}
		},
		getCurrentTime: () => {
			return currentTime;
		},
		isPlaying: () => {
			return playing;
		},
		pause: () => {
			playing = false;
			clearPlayTimeout();
			emitter.dispatchPause();
		},
		play: (timeout: NodeJS.Timeout) => {
			playing = true;
			setPlayTimeout(timeout);
			emitter.dispatchPlay();
		},
		emitter,
	};
};
