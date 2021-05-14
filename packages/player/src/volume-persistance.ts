const VOLUME_PERSISTANCE_KEY = 'remotion.volumePreference';

export const persistVolume = (volume: number) => {
	window.localStorage.setItem(VOLUME_PERSISTANCE_KEY, String(volume));
};

export const getPreferredVolume = () => {
	const val = window.localStorage.getItem(VOLUME_PERSISTANCE_KEY);
	return val ? Number(val) : 1;
};
