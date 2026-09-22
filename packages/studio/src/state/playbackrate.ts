const key = 'remotion.playbackrate';

export const commonPlaybackRates: number[] = [
	-4, -2, -1, -0.5, -0.25, 0.25, 0.5, 1, 1.5, 2, 4,
];

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
