export const isCorsError = (error: Error) => {
	return (
		// Chrome
		error.message.includes('Failed to fetch') ||
		// Safari
		error.message.includes('Load failed') ||
		// Firefox
		error.message.includes('NetworkError when attempting to fetch resource')
	);
};
