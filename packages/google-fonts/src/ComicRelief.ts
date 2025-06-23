import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Comic Relief',
	importName: 'ComicRelief',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Comic+Relief:ital,wght@0,400;0,700',
	unicodeRanges: {
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/comicrelief/v2/BCauqZkHrvL55SZ8uaEhHMYGXxhgPgs.woff2',
				greek:
					'https://fonts.gstatic.com/s/comicrelief/v2/BCauqZkHrvL55SZ8uaEhHMYGWBhgPgs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/comicrelief/v2/BCauqZkHrvL55SZ8uaEhHMYGVRhgPgs.woff2',
				latin:
					'https://fonts.gstatic.com/s/comicrelief/v2/BCauqZkHrvL55SZ8uaEhHMYGWxhg.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/comicrelief/v2/BCaxqZkHrvL55SZ8uaEhHMYO4D11BSojE1w.woff2',
				greek:
					'https://fonts.gstatic.com/s/comicrelief/v2/BCaxqZkHrvL55SZ8uaEhHMYO4D11AiojE1w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/comicrelief/v2/BCaxqZkHrvL55SZ8uaEhHMYO4D11DyojE1w.woff2',
				latin:
					'https://fonts.gstatic.com/s/comicrelief/v2/BCaxqZkHrvL55SZ8uaEhHMYO4D11ASoj.woff2',
			},
		},
	},
	subsets: ['cyrillic', 'greek', 'latin', 'latin-ext'],
});

export const fontFamily = 'Comic Relief' as const;

type Variants = {
	normal: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'greek' | 'latin' | 'latin-ext';
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
