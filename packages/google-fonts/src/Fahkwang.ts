import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Fahkwang',
	importName: 'Fahkwang',
	version: 'v16',
	url: 'https://fonts.googleapis.com/css2?family=Fahkwang:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		thai: 'U+0E01-0E5B, U+200C-200D, U+25CC',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgHFQLD1Zlyjx.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgHFQLCZZlyjx.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgHFQLCdZlyjx.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgHFQLClZlw.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgBVTLD1Zlyjx.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgBVTLCZZlyjx.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgBVTLCdZlyjx.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgBVTLClZlw.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa36Uj3zpmBOgbNpOqNiKpxORZ4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa36Uj3zpmBOgbNpOqNiLFxORZ4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa36Uj3zpmBOgbNpOqNiLBxORZ4.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa36Uj3zpmBOgbNpOqNiL5xOQ.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgE1SLD1Zlyjx.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgE1SLCZZlyjx.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgE1SLCdZlyjx.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgE1SLClZlw.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgGFVLD1Zlyjx.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgGFVLCZZlyjx.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgGFVLCdZlyjx.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgGFVLClZlw.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgAVULD1Zlyjx.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgAVULCZZlyjx.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgAVULCdZlyjx.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa06Uj3zpmBOgbNpOqNgAVULClZlw.woff2',
			},
		},
		normal: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJHmalCHCtBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJHmalZHCtBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJHmalYHCtBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJHmalWHCs.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIjmqlCHCtBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIjmqlZHCtBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIjmqlYHCtBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIjmqlWHCs.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noax6Uj3zpmBOgbNpOqcuLxpPQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noax6Uj3zpmBOgbNpOqHuLxpPQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noax6Uj3zpmBOgbNpOqGuLxpPQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noax6Uj3zpmBOgbNpOqIuLw.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJ7m6lCHCtBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJ7m6lZHCtBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJ7m6lYHCtBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJ7m6lWHCs.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJXnKlCHCtBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJXnKlZHCtBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJXnKlYHCtBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOJXnKlWHCs.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIznalCHCtBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIznalZHCtBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIznalYHCtBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/fahkwang/v16/Noa26Uj3zpmBOgbNpOIznalWHCs.woff2',
			},
		},
	},
});

export const fontFamily = 'Fahkwang' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
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
