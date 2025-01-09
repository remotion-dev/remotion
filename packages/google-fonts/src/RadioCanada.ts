import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Radio Canada',
	importName: 'RadioCanada',
	version: 'v21',
	url: 'https://fonts.googleapis.com/css2?family=Radio+Canada:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		'canadian-aboriginal':
			'U+02C7, U+02D8-02D9, U+02DB, U+0307, U+1400-167F, U+18B0-18F5, U+25CC, U+11AB0-11ABF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgU-z9MV0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgc-z9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgfOz9.woff2',
			},
			'400': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgU-z9MV0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgc-z9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgfOz9.woff2',
			},
			'500': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgU-z9MV0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgc-z9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgfOz9.woff2',
			},
			'600': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgU-z9MV0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgc-z9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgfOz9.woff2',
			},
			'700': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgU-z9MV0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgc-z9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXA3ISXn0dBMcibU6jlAqrdcwAMBJuK9IgQn4bfnSrgfOz9.woff2',
			},
		},
		normal: {
			'300': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRUDQfvT5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWDQfvT5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWHQfvT5.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRW_Qfg.woff2',
			},
			'400': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRUDQfvT5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWDQfvT5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWHQfvT5.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRW_Qfg.woff2',
			},
			'500': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRUDQfvT5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWDQfvT5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWHQfvT5.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRW_Qfg.woff2',
			},
			'600': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRUDQfvT5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWDQfvT5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWHQfvT5.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRW_Qfg.woff2',
			},
			'700': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRUDQfvT5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWDQfvT5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRWHQfvT5.woff2',
				latin:
					'https://fonts.gstatic.com/s/radiocanada/v21/XRXG3ISXn0dBMcibU6jlAqr3ejLv5OLZYiYXik6dRW_Qfg.woff2',
			},
		},
	},
});

export const fontFamily = 'Radio Canada' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'canadian-aboriginal' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'canadian-aboriginal' | 'latin' | 'latin-ext' | 'vietnamese';
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
