export type FontFormat = 'woff2' | 'woff' | 'opentype' | 'truetype';

export const getFontFormat = (url: string): FontFormat => {
	if (typeof url !== 'string') {
		throw new TypeError(
			`Expected a URL string but received ${url === undefined ? 'undefined' : typeof url}. Make sure to pass a "url" field in the options object of loadFont().`,
		);
	}

	// Prefer the extension of the path, ignoring query strings and hashes
	// (e.g. signed URLs). Fall back to the end of the URL for endpoints
	// that put the file name in the query (e.g. ?file=font.woff2).
	const lastPathSegment = url.split(/[?#]/)[0].split('/').pop() ?? '';
	const pathExt = lastPathSegment.includes('.')
		? lastPathSegment.split('.').pop()?.toLowerCase()
		: null;
	const ext =
		pathExt && ['woff2', 'woff', 'otf', 'ttf'].includes(pathExt)
			? pathExt
			: url.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'woff2':
			return 'woff2';
		case 'woff':
			return 'woff';
		case 'otf':
			return 'opentype';
		case 'ttf':
			return 'truetype';
		default:
			throw new Error(
				`Could not automatically derive font format from the URL "${url.length > 200 ? `${url.slice(0, 200)}...` : url}". Pass the "format" parameter explicitly ("woff2", "woff", "opentype" or "truetype").`,
			);
	}
};
