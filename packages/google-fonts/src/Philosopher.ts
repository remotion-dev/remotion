import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Philosopher',
	importName: 'Philosopher',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/philosopher/v19/vEFX2_5QCwIS4_Dhez5jcWBrf0I81-qe.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFX2_5QCwIS4_Dhez5jcWBrf0s81-qe.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFX2_5QCwIS4_Dhez5jcWBrf0A81-qe.woff2',
				latin:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFX2_5QCwIS4_Dhez5jcWBrf0881w.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/philosopher/v19/vEFK2_5QCwIS4_Dhez5jcWBrd_QZwti_Wo7H.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFK2_5QCwIS4_Dhez5jcWBrd_QZwtG_Wo7H.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFK2_5QCwIS4_Dhez5jcWBrd_QZwtq_Wo7H.woff2',
				latin:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFK2_5QCwIS4_Dhez5jcWBrd_QZwtW_Wg.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/philosopher/v19/vEFV2_5QCwIS4_Dhez5jcWBjT00k0w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFV2_5QCwIS4_Dhez5jcWBqT00k0w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFV2_5QCwIS4_Dhez5jcWBhT00k0w.woff2',
				latin:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFV2_5QCwIS4_Dhez5jcWBuT00.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/philosopher/v19/vEFI2_5QCwIS4_Dhez5jcWjValgW8tenXg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFI2_5QCwIS4_Dhez5jcWjValgf8tenXg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFI2_5QCwIS4_Dhez5jcWjValgU8tenXg.woff2',
				latin:
					'https://fonts.gstatic.com/s/philosopher/v19/vEFI2_5QCwIS4_Dhez5jcWjValgb8tc.woff2',
			},
		},
	},
});

export const fontFamily = 'Philosopher' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'vietnamese';
	};
	normal: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'vietnamese';
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
