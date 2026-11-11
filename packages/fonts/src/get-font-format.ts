export type FontFormat = 'woff2' | 'woff' | 'opentype' | 'truetype';

const formatsByExtension = new Map<string | undefined, FontFormat>([
	['woff2', 'woff2'],
	['woff', 'woff'],
	['otf', 'opentype'],
	['ttf', 'truetype'],
]);

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
		: undefined;
	const format =
		formatsByExtension.get(pathExt) ??
		formatsByExtension.get(url.split('.').pop()?.toLowerCase());

	if (!format) {
		throw new Error(
			`Could not automatically derive font format from the URL "${url.length > 200 ? `${url.slice(0, 200)}...` : url}". Pass the "format" parameter explicitly ("woff2", "woff", "opentype" or "truetype").`,
		);
	}

	return format;
};
