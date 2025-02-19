export type FontFormat = 'woff2' | 'woff' | 'opentype' | 'truetype';

export const getFontFormat = (url: string): FontFormat => {
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
