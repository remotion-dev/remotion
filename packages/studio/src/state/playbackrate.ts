const key = 'remotion.playbackrate';

export const commonPlaybackRates: number[] = [
	-4, -2, -1, -0.5, -0.25, 0.25, 0.5, 1, 1.5, 2, 4,
];

export const persistPlaybackRate = (option: number) => {
	localStorage.setItem(key, String(option));
};

export const loadPlaybackRate = () => {
	if (typeof window === 'undefined') {
		return 1;
	}

	const item = localStorage.getItem(key);
	if (item === null) {
		return 1;
	}

	// Only restore rates the Studio can select, so a stale or corrupted value
	// (e.g. 0 or NaN) cannot stall playback after a reload.
	const playbackRate = Number(item);
	return commonPlaybackRates.includes(playbackRate) ? playbackRate : 1;
};
