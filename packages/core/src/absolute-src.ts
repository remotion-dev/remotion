export const getAbsoluteSrc = (relativeSrc: string) => {
	if (typeof window === 'undefined') {
		return relativeSrc;
	}

	if (relativeSrc.startsWith('http://') || relativeSrc.startsWith('https://')) {
		return relativeSrc;
	}

	return new URL(relativeSrc, window.origin).href;
};
