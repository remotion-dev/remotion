import {getNavigationWindow} from './url-state';

let initialized = false;
let overridePixelRatio: number | null = null;

export const getStudioPixelRatio = (): number => {
	if (!initialized) {
		initialized = true;
		const storageKey = 'remotion.studioPixelRatio';
		const raw = new URLSearchParams(getNavigationWindow().location.search).get(
			'studioPixelRatio',
		);
		const fromUrl = raw === null ? Number.NaN : Number(raw);
		if (Number.isFinite(fromUrl) && fromUrl > 0) {
			overridePixelRatio = fromUrl;
			try {
				window.sessionStorage.setItem(storageKey, String(fromUrl));
			} catch {
				// Keep the override in memory if session storage is unavailable.
			}
		} else {
			try {
				const stored = Number(window.sessionStorage.getItem(storageKey));
				if (Number.isFinite(stored) && stored > 0) {
					overridePixelRatio = stored;
				}
			} catch {
				// Use the device pixel ratio if session storage is unavailable.
			}
		}
	}

	return overridePixelRatio ?? window.devicePixelRatio;
};
