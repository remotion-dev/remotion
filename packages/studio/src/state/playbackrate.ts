const key = 'remotion.playbackrate';
const stepKey = 'remotion.playbackrate-step';
const defaultStep = 0.1;

export const commonPlaybackRates: number[] = [
	-4, -2, -1, -0.5, -0.25, 0.25, 0.5, 1, 1.5, 2, 4,
];

export const persistPlaybackRate = (option: number) => {
	localStorage.setItem(key, String(option));
};

export const persistPlaybackRateStep = (step: number) => {
	localStorage.setItem(stepKey, String(step));
};

export const loadPlaybackRateStep = () => {
	if (typeof window === 'undefined') {
		return defaultStep;
	}

	const item = localStorage.getItem(stepKey);
	if (item === null) {
		return defaultStep;
	}

	const step = Number(item);
	return Number.isFinite(step) && step >= 0.01 && step <= 4
		? step
		: defaultStep;
};

export const loadPlaybackRate = () => {
	if (typeof window === 'undefined') {
		return 1;
	}

	const item = localStorage.getItem(key);
	if (item === null) {
		return 1;
	}

	// A zero or out-of-range persisted value could stall or destabilize playback.
	const playbackRate = Number(item);
	return Number.isFinite(playbackRate) &&
		Math.abs(playbackRate) >= 0.1 &&
		Math.abs(playbackRate) <= 4
		? playbackRate
		: 1;
};
