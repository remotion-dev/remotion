import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Bad Script',
	importName: 'BadScript',
	version: 'v16',
	url: 'https://fonts.googleapis.com/css2?family=Bad+Script:ital,wght@0,400',
	unicodeRanges: {
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/badscript/v16/6NUT8F6PJgbFWQn47_x7pO8kzO1A.woff2',
				latin:
					'https://fonts.gstatic.com/s/badscript/v16/6NUT8F6PJgbFWQn47_x7pOskzA.woff2',
			},
		},
	},
});

export const fontFamily = 'Bad Script' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'cyrillic' | 'latin';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
