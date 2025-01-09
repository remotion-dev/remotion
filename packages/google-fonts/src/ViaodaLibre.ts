import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Viaoda Libre',
	importName: 'ViaodaLibre',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Viaoda+Libre:ital,wght@0,400',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/viaodalibre/v18/vEFW2_lWCgoR6OKuRz9kcRV5ZWgZ6tM.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/viaodalibre/v18/vEFW2_lWCgoR6OKuRz9kcRV5bGgZ6tM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/viaodalibre/v18/vEFW2_lWCgoR6OKuRz9kcRV5Z2gZ6tM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/viaodalibre/v18/vEFW2_lWCgoR6OKuRz9kcRV5ZmgZ6tM.woff2',
				latin:
					'https://fonts.gstatic.com/s/viaodalibre/v18/vEFW2_lWCgoR6OKuRz9kcRV5aGgZ.woff2',
			},
		},
	},
});

export const fontFamily = 'Viaoda Libre' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
