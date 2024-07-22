import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Andika',
	importName: 'Andika',
	version: 'v25',
	url: 'https://fonts.googleapis.com/css2?family=Andika:ital,wght@0,400;0,700;1,400;1,700',
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
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem9Ya6iyW-Lwqgwb4YfcrgmVA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/andika/v25/mem9Ya6iyW-Lwqgwb4YWcrgmVA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/andika/v25/mem9Ya6iyW-Lwqgwb4YdcrgmVA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem9Ya6iyW-Lwqgwb4YccrgmVA.woff2',
				latin:
					'https://fonts.gstatic.com/s/andika/v25/mem9Ya6iyW-Lwqgwb4YScrg.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem6Ya6iyW-Lwqgwb46pV60Udc1UAw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/andika/v25/mem6Ya6iyW-Lwqgwb46pV60ddc1UAw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/andika/v25/mem6Ya6iyW-Lwqgwb46pV60Wdc1UAw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem6Ya6iyW-Lwqgwb46pV60Xdc1UAw.woff2',
				latin:
					'https://fonts.gstatic.com/s/andika/v25/mem6Ya6iyW-Lwqgwb46pV60Zdc0.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem_Ya6iyW-LwqgwZ7YQarw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/andika/v25/mem_Ya6iyW-LwqgwbrYQarw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/andika/v25/mem_Ya6iyW-LwqgwZbYQarw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem_Ya6iyW-LwqgwZLYQarw.woff2',
				latin:
					'https://fonts.gstatic.com/s/andika/v25/mem_Ya6iyW-LwqgwarYQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem8Ya6iyW-Lwqg40ZMFWJ0bbck.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/andika/v25/mem8Ya6iyW-Lwqg40ZMFUZ0bbck.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/andika/v25/mem8Ya6iyW-Lwqg40ZMFWp0bbck.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/andika/v25/mem8Ya6iyW-Lwqg40ZMFW50bbck.woff2',
				latin:
					'https://fonts.gstatic.com/s/andika/v25/mem8Ya6iyW-Lwqg40ZMFVZ0b.woff2',
			},
		},
	},
});

export const fontFamily = 'Andika' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '400' | '700';
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
