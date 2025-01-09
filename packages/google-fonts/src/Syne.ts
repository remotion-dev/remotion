import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Syne',
	importName: 'Syne',
	version: 'v22',
	url: 'https://fonts.googleapis.com/css2?family=Syne:ital,wght@0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				greek:
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2NL9Hz_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm25L9Hz_.woff2',
				latin: 'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2BL9A.woff2',
			},
			'500': {
				greek:
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2NL9Hz_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm25L9Hz_.woff2',
				latin: 'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2BL9A.woff2',
			},
			'600': {
				greek:
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2NL9Hz_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm25L9Hz_.woff2',
				latin: 'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2BL9A.woff2',
			},
			'700': {
				greek:
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2NL9Hz_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm25L9Hz_.woff2',
				latin: 'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2BL9A.woff2',
			},
			'800': {
				greek:
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2NL9Hz_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm25L9Hz_.woff2',
				latin: 'https://fonts.gstatic.com/s/syne/v22/8vIH7w4qzmVxm2BL9A.woff2',
			},
		},
	},
});

export const fontFamily = 'Syne' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800';
		subsets: 'greek' | 'latin' | 'latin-ext';
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
