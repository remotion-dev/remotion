import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Cardo',
	importName: 'Cardo',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400',
	unicodeRanges: {
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'greek-ext':
					'https://fonts.gstatic.com/s/cardo/v19/wlpxgwjKBV1pqhv97I8x3F5O.woff2',
				greek:
					'https://fonts.gstatic.com/s/cardo/v19/wlpxgwjKBV1pqhv97IAx3F5O.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cardo/v19/wlpxgwjKBV1pqhv97I0x3F5O.woff2',
				latin:
					'https://fonts.gstatic.com/s/cardo/v19/wlpxgwjKBV1pqhv97IMx3A.woff2',
			},
		},
		normal: {
			'400': {
				'greek-ext':
					'https://fonts.gstatic.com/s/cardo/v19/wlp_gwjKBV1pqhv03IEp2A.woff2',
				greek:
					'https://fonts.gstatic.com/s/cardo/v19/wlp_gwjKBV1pqhv73IEp2A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cardo/v19/wlp_gwjKBV1pqhv23IEp2A.woff2',
				latin:
					'https://fonts.gstatic.com/s/cardo/v19/wlp_gwjKBV1pqhv43IE.woff2',
			},
			'700': {
				'greek-ext':
					'https://fonts.gstatic.com/s/cardo/v19/wlpygwjKBV1pqhND-ZQa-WN3aQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/cardo/v19/wlpygwjKBV1pqhND-ZQV-WN3aQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cardo/v19/wlpygwjKBV1pqhND-ZQY-WN3aQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/cardo/v19/wlpygwjKBV1pqhND-ZQW-WM.woff2',
			},
		},
	},
});

export const fontFamily = 'Cardo' as const;

type Variants = {
	italic: {
		weights: '400';
		subsets: 'greek' | 'greek-ext' | 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '700';
		subsets: 'greek' | 'greek-ext' | 'latin' | 'latin-ext';
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
