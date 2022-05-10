export const isServeUrl = (potentialUrl: string) => {
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
