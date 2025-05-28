export const makePlaybackState = () => {
	let currentTime = 0;
	let playing = false;
	let playTimeout: NodeJS.Timeout | null = null;

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
			currentTime = time;
		},
		getCurrentTime: () => {
			return currentTime;
		},
		getPlaying: () => {
			return playing;
		},
		pause: () => {
			playing = false;
			clearPlayTimeout();
		},
		play: (timeout: NodeJS.Timeout) => {
			playing = true;
			setPlayTimeout(timeout);
		},
	};
};
