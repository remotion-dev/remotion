export const getAbsoluteSrc = (relativeSrc: string) => {
	if (typeof window === 'undefined') {
		return relativeSrc;
	}

	// URLs starting with these prefixes are already absolute and should be returned as-is
	if (
		relativeSrc.startsWith('http://') ||
		relativeSrc.startsWith('https://') ||
		relativeSrc.startsWith('file://') ||
		relativeSrc.startsWith('blob:') ||
		relativeSrc.startsWith('data:')
	) {
		return relativeSrc;
	}

	return new URL(relativeSrc, window.origin).href;
};
