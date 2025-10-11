export const getAbsoluteSrc = (relativeSrc: string) => {
	if (typeof window === 'undefined') {
		return relativeSrc;
	}

	// https://github.com/remotion-dev/remotion/issues/5359
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
