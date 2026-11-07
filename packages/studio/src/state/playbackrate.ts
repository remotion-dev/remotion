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

	// Reject zero and out-of-range values so corrupted storage cannot stall playback.
	const playbackRate = Number(item);
	return Number.isFinite(playbackRate) &&
		playbackRate !== 0 &&
		Math.abs(playbackRate) <= 4
		? playbackRate
		: 1;
};

export const stepPlaybackRate = (playbackRate: number, direction: 1 | -1) => {
	const tenths = Math.abs(playbackRate) * 10;
	const next =
		direction === 1
			? Math.floor(tenths + 1e-9) + 1
			: Math.ceil(tenths - 1e-9) - 1;
	return (Math.sign(playbackRate) * Math.min(40, Math.max(1, next))) / 10;
};
