export const getFontFormat = (url: string): string => {
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
			throw new Error(`Unsuppoted font format: ${ext}`);
	}
};
