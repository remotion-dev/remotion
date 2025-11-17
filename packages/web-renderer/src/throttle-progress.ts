import type {RenderMediaOnWebProgressCallback} from './render-media-on-web';

const DEFAULT_THROTTLE_MS = 250;

/**
 * Creates a throttled version of a progress callback that ensures it's not called
 * more frequently than the specified interval (default: 250ms)
 */
export const createThrottledProgressCallback = (
	callback: RenderMediaOnWebProgressCallback | null,
	throttleMs: number = DEFAULT_THROTTLE_MS,
): RenderMediaOnWebProgressCallback | null => {
	if (!callback) {
		return null;
	}

	let lastCallTime = 0;
	let pendingUpdate: Parameters<RenderMediaOnWebProgressCallback>[0] | null =
		null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const throttled: RenderMediaOnWebProgressCallback = (progress) => {
		const now = Date.now();
		const timeSinceLastCall = now - lastCallTime;

		// Always store the latest progress
		pendingUpdate = progress;

		// If enough time has passed, call immediately
		if (timeSinceLastCall >= throttleMs) {
			lastCallTime = now;
			callback(progress);
			pendingUpdate = null;

			// Clear any pending timeout
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		} else if (timeoutId === null) {
			// Schedule a call for when the throttle period expires
			const remainingTime = throttleMs - timeSinceLastCall;
			timeoutId = setTimeout(() => {
				if (pendingUpdate !== null) {
					lastCallTime = Date.now();
					callback(pendingUpdate);
					pendingUpdate = null;
				}
				timeoutId = null;
			}, remainingTime);
		}
	};

	return throttled;
};
