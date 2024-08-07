import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Prata',
	importName: 'Prata',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Prata:ital,wght@0,400',
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
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/prata/v20/6xKhdSpbNNCT-sWCCm7JLQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/prata/v20/6xKhdSpbNNCT-sWLCm7JLQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prata/v20/6xKhdSpbNNCT-sWACm7JLQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/prata/v20/6xKhdSpbNNCT-sWPCm4.woff2',
			},
		},
	},
});

export const fontFamily = 'Prata' as const;

type Variants = {
	normal: {
		weights: '400';
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
