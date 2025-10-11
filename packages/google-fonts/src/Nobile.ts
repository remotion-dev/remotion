import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Nobile',
	importName: 'Nobile',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Nobile:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700',
	unicodeRanges: {
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/nobile/v19/m8JRjflSeaOVl1iGXJ3QULF9bw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nobile/v19/m8JRjflSeaOVl1iGXJ3aULF9bw.woff2',
				latin:
					'https://fonts.gstatic.com/s/nobile/v19/m8JRjflSeaOVl1iGXJ3UULE.woff2',
			},
			'500': {
				cyrillic:
					'https://fonts.gstatic.com/s/nobile/v19/m8JWjflSeaOVl1iGXJUnc6RGTm663A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nobile/v19/m8JWjflSeaOVl1iGXJUnc6RMTm663A.woff2',
				latin:
					'https://fonts.gstatic.com/s/nobile/v19/m8JWjflSeaOVl1iGXJUnc6RCTm4.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/nobile/v19/m8JWjflSeaOVl1iGXJVvdaRGTm663A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nobile/v19/m8JWjflSeaOVl1iGXJVvdaRMTm663A.woff2',
				latin:
					'https://fonts.gstatic.com/s/nobile/v19/m8JWjflSeaOVl1iGXJVvdaRCTm4.woff2',
			},
		},
		normal: {
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/nobile/v19/m8JTjflSeaOVl1iGXa3WSLU.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nobile/v19/m8JTjflSeaOVl1iGV63WSLU.woff2',
				latin:
					'https://fonts.gstatic.com/s/nobile/v19/m8JTjflSeaOVl1iGWa3W.woff2',
			},
			'500': {
				cyrillic:
					'https://fonts.gstatic.com/s/nobile/v19/m8JQjflSeaOVl1iOqo7Dc5RAVmo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nobile/v19/m8JQjflSeaOVl1iOqo7DeZRAVmo.woff2',
				latin:
					'https://fonts.gstatic.com/s/nobile/v19/m8JQjflSeaOVl1iOqo7Dd5RA.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/nobile/v19/m8JQjflSeaOVl1iO4ojDc5RAVmo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nobile/v19/m8JQjflSeaOVl1iO4ojDeZRAVmo.woff2',
				latin:
					'https://fonts.gstatic.com/s/nobile/v19/m8JQjflSeaOVl1iO4ojDd5RA.woff2',
			},
		},
	},
	subsets: ['cyrillic', 'latin', 'latin-ext'],
});

export const fontFamily = 'Nobile' as const;

type Variants = {
	italic: {
		weights: '400' | '500' | '700';
		subsets: 'cyrillic' | 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '500' | '700';
		subsets: 'cyrillic' | 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
