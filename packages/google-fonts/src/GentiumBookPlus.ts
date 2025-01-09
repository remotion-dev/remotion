import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Gentium Book Plus',
	importName: 'GentiumBookPlus',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFN2-RHBgUK5fbjKxRpbBtJPyRpocKdT7zmqfPV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFN2-RHBgUK5fbjKxRpbBtJPyRpocKdT7XmqfPV.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFN2-RHBgUK5fbjKxRpbBtJPyRpocKdT73mqfPV.woff2',
				greek:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFN2-RHBgUK5fbjKxRpbBtJPyRpocKdT7LmqfPV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFN2-RHBgUK5fbjKxRpbBtJPyRpocKdT77mqfPV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFN2-RHBgUK5fbjKxRpbBtJPyRpocKdT7_mqfPV.woff2',
				latin:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFN2-RHBgUK5fbjKxRpbBtJPyRpocKdT7HmqQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFA2-RHBgUK5fbjKxRpbBtJPyRpocKdRwrDvMH0eIe1.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFA2-RHBgUK5fbjKxRpbBtJPyRpocKdRwrDvMj0eIe1.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFA2-RHBgUK5fbjKxRpbBtJPyRpocKdRwrDvMD0eIe1.woff2',
				greek:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFA2-RHBgUK5fbjKxRpbBtJPyRpocKdRwrDvM_0eIe1.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFA2-RHBgUK5fbjKxRpbBtJPyRpocKdRwrDvMP0eIe1.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFA2-RHBgUK5fbjKxRpbBtJPyRpocKdRwrDvML0eIe1.woff2',
				latin:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFA2-RHBgUK5fbjKxRpbBtJPyRpocKdRwrDvMz0eA.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFL2-RHBgUK5fbjKxRpbBtJPyRpocKVf7P-rQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFL2-RHBgUK5fbjKxRpbBtJPyRpocKcf7P-rQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFL2-RHBgUK5fbjKxRpbBtJPyRpocKUf7P-rQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFL2-RHBgUK5fbjKxRpbBtJPyRpocKbf7P-rQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFL2-RHBgUK5fbjKxRpbBtJPyRpocKXf7P-rQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFL2-RHBgUK5fbjKxRpbBtJPyRpocKWf7P-rQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFL2-RHBgUK5fbjKxRpbBtJPyRpocKYf7M.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFO2-RHBgUK5fbjKxRpbBtJPyRpocojWqbMjM7sfA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFO2-RHBgUK5fbjKxRpbBtJPyRpocojWqbFjM7sfA.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFO2-RHBgUK5fbjKxRpbBtJPyRpocojWqbNjM7sfA.woff2',
				greek:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFO2-RHBgUK5fbjKxRpbBtJPyRpocojWqbCjM7sfA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFO2-RHBgUK5fbjKxRpbBtJPyRpocojWqbOjM7sfA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFO2-RHBgUK5fbjKxRpbBtJPyRpocojWqbPjM7sfA.woff2',
				latin:
					'https://fonts.gstatic.com/s/gentiumbookplus/v1/vEFO2-RHBgUK5fbjKxRpbBtJPyRpocojWqbBjM4.woff2',
			},
		},
	},
});

export const fontFamily = 'Gentium Book Plus' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
