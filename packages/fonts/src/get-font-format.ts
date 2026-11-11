export type FontFormat = 'woff2' | 'woff' | 'opentype' | 'truetype';

export const getFontFormat = (url: string): FontFormat => {
	if (typeof url !== 'string') {
		throw new TypeError(
			`Expected a URL string but received ${url === undefined ? 'undefined' : typeof url}. Make sure to pass a "url" field in the options object of loadFont().`,
		);
	}

	const pathname = url.split(/[?#]/)[0];
	const lastSegment = pathname.split('/').pop() ?? '';
	const ext = lastSegment.includes('.')
		? lastSegment.split('.').pop()?.toLowerCase()
		: null;
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
				`Could not automatically derive font format from the URL "${url.length > 200 ? `${url.slice(0, 200)}...` : url}"${ext ? ` (extension: ${ext})` : ' (no file extension)'}. Pass the "format" parameter explicitly ("woff2", "woff", "opentype" or "truetype").`,
			);
	}
};
