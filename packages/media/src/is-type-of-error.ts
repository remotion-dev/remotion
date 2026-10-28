/**
 * Utility to check if error is network error
 * @param error
 * @returns
 */
export function isNetworkError(error: Error) {
	if (
		// Chrome
		error.message.includes('Failed to fetch') ||
		// Safari
		error.message.includes('Load failed') ||
		// Firefox
		error.message.includes('NetworkError when attempting to fetch resource')
	) {
		return true;
	}

	return false;
}

export function isUnsupportedConfigurationError(error: Error) {
	return error.message.includes('Unsupported configuration');
}

/**
 * Browsers (at least Chromium) close codecs that have been idle for a long time
 * and report "QuotaExceededError: Codec reclaimed due to inactivity."
 * Mirrors Mediabunny's internal `isCodecReclaimedError`, which is not exported.
 * `QuotaExceededError` alone is also used for genuine quota failures.
 */
export function isCodecReclaimedError(error: unknown) {
	return (
		error instanceof DOMException &&
		error.name === 'QuotaExceededError' &&
		/reclaimed/i.test(error.message)
	);
}
