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
 * Chrome reclaims WebCodecs decoders that have been idle for a while and
 * rejects pending work with "QuotaExceededError: Codec reclaimed due to inactivity."
 */
export function isCodecReclaimedError(error: unknown) {
	return error instanceof DOMException && error.name === 'QuotaExceededError';
}
