export const resolveGifSource = (src: string): string => {
	return new URL(src, typeof window === 'undefined' ? undefined : window.origin)
		.href;
};
