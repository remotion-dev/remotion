export const resolveUrl = (src: string) => {
	try {
		const resolvedUrl =
			typeof window !== 'undefined' && typeof window.location !== 'undefined'
				? new URL(src, window.location.origin)
				: new URL(src);

		return resolvedUrl;
	} catch {
		return src;
	}
};
