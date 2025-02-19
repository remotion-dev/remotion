import {Internals, type LogLevel} from 'remotion';

const VOLUME_PERSISTANCE_KEY = 'remotion.volumePreference';

export const persistVolume = (volume: number, logLevel: LogLevel) => {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.localStorage.setItem(VOLUME_PERSISTANCE_KEY, String(volume));
	} catch (e) {
		// User can disallow localStorage access
		// https://github.com/remotion-dev/remotion/issues/3540

		Internals.Log.error(logLevel, 'Could not persist volume', e);
	}
};

export const getPreferredVolume = (): number => {
	if (typeof window === 'undefined') {
		return 1;
	}

	try {
		const val = window.localStorage.getItem(VOLUME_PERSISTANCE_KEY);
		return val ? Number(val) : 1;
	} catch {
		// User can disallow localStorage access
		// https://github.com/remotion-dev/remotion/issues/3540
		return 1;
	}
};
