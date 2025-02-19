import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Averia Serif Libre',
	importName: 'AveriaSerifLibre',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/averiaseriflibre/v18/neIbzD2ms4wxr6GvjeD0X88SHPyX2xYOpzMmw50pXrY.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/averiaseriflibre/v18/neIUzD2ms4wxr6GvjeD0X88SHPyX2xYOpzuN4Yg.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/averiaseriflibre/v18/neIbzD2ms4wxr6GvjeD0X88SHPyX2xYOpzM2xJ0pXrY.woff2',
			},
		},
		normal: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/averiaseriflibre/v18/neIVzD2ms4wxr6GvjeD0X88SHPyX2xYGCSmaxq0r.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/averiaseriflibre/v18/neIWzD2ms4wxr6GvjeD0X88SHPyX2xYOoguP.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/averiaseriflibre/v18/neIVzD2ms4wxr6GvjeD0X88SHPyX2xYGGS6axq0r.woff2',
			},
		},
	},
});

export const fontFamily = 'Averia Serif Libre' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '700';
		subsets: 'latin';
	};
	normal: {
		weights: '300' | '400' | '700';
		subsets: 'latin';
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
