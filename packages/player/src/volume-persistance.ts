import {Internals, type LogLevel} from 'remotion';

const DEFAULT_VOLUME_PERSISTANCE_KEY = 'remotion.volumePreference';

export const persistVolume = (
	volume: number,
	logLevel: LogLevel,
	volumePersistenceKey: string | null,
) => {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.localStorage.setItem(
			volumePersistenceKey ?? DEFAULT_VOLUME_PERSISTANCE_KEY,
			String(volume),
		);
	} catch (e) {
		// User can disallow localStorage access
		// https://github.com/remotion-dev/remotion/issues/3540

		Internals.Log.error(logLevel, 'Could not persist volume', e);
	}
};

export const getPreferredVolume = (
	volumePersistenceKey: string | null,
): number => {
	if (typeof window === 'undefined') {
		return 1;
	}

	try {
		const val = window.localStorage.getItem(
			volumePersistenceKey ?? DEFAULT_VOLUME_PERSISTANCE_KEY,
		);
		return val ? Number(val) : 1;
	} catch {
		// User can disallow localStorage access
		// https://github.com/remotion-dev/remotion/issues/3540
		return 1;
	}
};
