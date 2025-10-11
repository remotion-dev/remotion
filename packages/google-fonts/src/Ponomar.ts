import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Ponomar',
	importName: 'Ponomar',
	version: 'v5',
	url: 'https://fonts.googleapis.com/css2?family=Ponomar:ital,wght@0,400',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ponomar/v5/or3iQ6zp3fKD2wImXJ7XA4g8.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ponomar/v5/or3iQ6zp3fKD2wImXJfXA4g8.woff2',
				latin:
					'https://fonts.gstatic.com/s/ponomar/v5/or3iQ6zp3fKD2wImXJPXAw.woff2',
			},
		},
	},
	subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
});

export const fontFamily = 'Ponomar' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin';
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
