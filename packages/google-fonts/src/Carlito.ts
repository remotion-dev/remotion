import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Carlito',
	importName: 'Carlito',
	version: 'v3',
	url: 'https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400;0,700;1,400;1,700',
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
					'https://fonts.gstatic.com/s/carlito/v3/3Jn_SDPw3m-pk039DDKxQ10AbuE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn_SDPw3m-pk039DDKxSl0AbuE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn_SDPw3m-pk039DDKxQl0AbuE.woff2',
				greek:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn_SDPw3m-pk039DDKxTV0AbuE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn_SDPw3m-pk039DDKxQV0AbuE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn_SDPw3m-pk039DDKxQF0AbuE.woff2',
				latin:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn_SDPw3m-pk039DDKxTl0A.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn6SDPw3m-pk039DDK59XgVXMBG6Oo.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn6SDPw3m-pk039DDK59XgVVcBG6Oo.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn6SDPw3m-pk039DDK59XgVXcBG6Oo.woff2',
				greek:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn6SDPw3m-pk039DDK59XgVUsBG6Oo.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn6SDPw3m-pk039DDK59XgVXsBG6Oo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn6SDPw3m-pk039DDK59XgVX8BG6Oo.woff2',
				latin:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn6SDPw3m-pk039DDK59XgVUcBG.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039DDqBTEUE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039DDOBTEUE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039DDuBTEUE.woff2',
				greek:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039DDSBTEUE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039DDiBTEUE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039DDmBTEUE.woff2',
				latin:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039DDeBTA.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykWXclU9hC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykWX4lU9hC.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykWXYlU9hC.woff2',
				greek:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykWXklU9hC.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykWXUlU9hC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykWXQlU9hC.woff2',
				latin:
					'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykWXolUw.woff2',
			},
		},
	},
});

export const fontFamily = 'Carlito' as const;

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
