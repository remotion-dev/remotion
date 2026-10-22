export const resolveGifSource = (src: string): string => {
	if (typeof window === 'undefined') {
		return src;
	}

	return new URL(src, document.baseURI).href;
};
