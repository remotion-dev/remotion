import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kurale',
	importName: 'Kurale',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Kurale:ital,wght@0,400',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		devanagari:
			'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/kurale/v12/4iCs6KV9e9dXjhoKcg72j00.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/kurale/v12/4iCs6KV9e9dXjhoKew72j00.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/kurale/v12/4iCs6KV9e9dXjhoKfg72j00.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kurale/v12/4iCs6KV9e9dXjhoKcQ72j00.woff2',
				latin:
					'https://fonts.gstatic.com/s/kurale/v12/4iCs6KV9e9dXjhoKfw72.woff2',
			},
		},
	},
});

export const fontFamily = 'Kurale' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'devanagari' | 'latin' | 'latin-ext';
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
