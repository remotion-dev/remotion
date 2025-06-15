const isAbsoluteUrl = (url: string): boolean => {
	return (
		url.startsWith('http://') ||
		url.startsWith('https://') ||
		url.startsWith('data:') ||
		url.startsWith('blob:') ||
		url.startsWith('file:')
	);
};

export const getAbsoluteSrc = (relativeSrc: string) => {
	// If the URL is already absolute, return it as-is (normalized)
	if (isAbsoluteUrl(relativeSrc)) {
		return new URL(relativeSrc).href;
	}

	// If window is undefined (server-side), return the relative path
	if (typeof window === 'undefined') {
		return relativeSrc;
	}

	// Make relative URL absolute using window.origin
	return new URL(relativeSrc, window.origin).href;
};
