export const getAbsoluteSrc = (relativeSrc: string) => {
	if (typeof window === 'undefined') {
		return relativeSrc;
	}

	return new URL(relativeSrc, window.origin).href;
};
