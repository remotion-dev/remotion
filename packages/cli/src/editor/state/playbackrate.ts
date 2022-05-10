const key = 'remotion.playbackrate';

export const persistPlaybackRate = (option: number) => {
	localStorage.setItem(key, String(option));
};

export const loadPlaybackRate = () => {
	if (typeof window !== 'undefined') {
		return 1;
	}

	const item = localStorage.getItem(key);
	if (item === null) {
		return 1;
	}

	return Number(item);
};
