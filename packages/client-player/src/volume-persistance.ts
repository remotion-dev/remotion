const VOLUME_PERSISTANCE_KEY = 'remotion.volumePreference';

export const persistVolume = (volume: number) => {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(VOLUME_PERSISTANCE_KEY, String(volume));
};

export const getPreferredVolume = (): number => {
	if (typeof window === 'undefined') {
		return 1;
	}

	const val = window.localStorage.getItem(VOLUME_PERSISTANCE_KEY);
	return val ? Number(val) : 1;
};
