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

export function isHttpError(error: Error) {
	// Mediabunny's UrlSource includes the HTTP status in errors for non-OK responses.
	return /^Error fetching .+: \d{3}(?: |$)/.test(error.message);
}

export function isUnsupportedConfigurationError(error: Error) {
	return error.message.includes('Unsupported configuration');
}
