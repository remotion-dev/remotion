export const resolveGifSource = (src: string): string => {
	return new URL(
		src,
		typeof window === 'undefined' ? undefined : window.location.origin
	).href;
};
