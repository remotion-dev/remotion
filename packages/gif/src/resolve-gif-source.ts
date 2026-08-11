export const resolveGifSource = (src: string): string => {
	if (typeof window === 'undefined') {
		return src;
	}

	return new URL(src, window.origin).href;
};
