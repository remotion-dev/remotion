export type FontFormat = 'woff2' | 'woff' | 'opentype' | 'truetype';

export const getFontFormat = (url: string): FontFormat => {
	if (typeof url !== 'string') {
		throw new TypeError(
			`Expected a URL string but received ${url === undefined ? 'undefined' : typeof url}. Make sure to pass a "url" field in the options object of loadFont().`,
		);
	}

	const ext = url.split('.').pop()?.toLowerCase();
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
				`Could not automatically derive font format from extension: ${ext}. Pass the "format" parameter explicitly.`,
			);
	}
};
