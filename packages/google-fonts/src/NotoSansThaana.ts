import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Thaana',
	importName: 'NotoSansThaana',
	version: 'v24',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thaana:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		thaana:
			'U+060C, U+061B-061C, U+061F, U+0660-066C, U+0780-07B1, U+200C-200F, U+25CC, U+FDF2, U+FDFD',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'200': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'300': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'400': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'500': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'600': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'700': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'800': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
			'900': {
				thaana:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rBKM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTuM7rBKM.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansthaana/v24/C8c44dM-vnz-s-3jaEsxlxHkBH-WTu07rA.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Thaana' as const;

type Variants = {
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'latin' | 'latin-ext' | 'thaana';
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
