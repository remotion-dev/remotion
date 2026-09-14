export const resolveAnimatedImageSource = (src: string): string => {
	if (typeof window === 'undefined') {
		return src;
	}

	return new URL(src, document.baseURI).href;
};
