export const isServeUrl = (potentialUrl: string) => {
	if (typeof potentialUrl === 'undefined') {
		throw new Error('serveUrl is undefined');
	}

	// Theoretically not a valid URL but handle the most basic cases of forgetting protocol in front
	if (
		potentialUrl.startsWith('www.') ||
		potentialUrl.includes('amazonaws.com')
	) {
		return true;
	}

	return (
		potentialUrl.startsWith('https://') || potentialUrl.startsWith('http://')
	);
};
