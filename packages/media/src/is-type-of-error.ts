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
