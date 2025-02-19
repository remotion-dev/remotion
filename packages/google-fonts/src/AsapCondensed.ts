import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Asap Condensed',
	importName: 'AsapCondensed',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Asap+Condensed:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
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
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUIFFumaIo8pO.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUIFFumeIo8pO.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUIFFummIow.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUOVGumaIo8pO.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUOVGumeIo8pO.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUOVGummIow.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxifypY1o9NHyXh3WvSbGSggdOeJWEFkr1ap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxifypY1o9NHyXh3WvSbGSggdOeJWEBkr1ap.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxifypY1o9NHyXh3WvSbGSggdOeJWE5krw.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUL1HumaIo8pO.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUL1HumeIo8pO.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUL1HummIow.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUJFAumaIo8pO.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUJFAumeIo8pO.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUJFAummIow.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUPVBumaIo8pO.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUPVBumeIo8pO.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUPVBummIow.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUOlCumaIo8pO.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUOlCumeIo8pO.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUOlCummIow.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUM1DumaIo8pO.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUM1DumeIo8pO.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxiYypY1o9NHyXh3WvSbGSggdOeJUM1DummIow.woff2',
			},
		},
		normal: {
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9DSVlMimuQpw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9DSVlNimuQpw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9DSVlDims.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8nSllMimuQpw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8nSllNimuQpw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8nSllDims.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxidypY1o9NHyXh3WvSbGSggdOeDaEx8qw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxidypY1o9NHyXh3WvSbGSggdOeCaEx8qw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxidypY1o9NHyXh3WvSbGSggdOeMaEw.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9_S1lMimuQpw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9_S1lNimuQpw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9_S1lDims.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9TTFlMimuQpw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9TTFlNimuQpw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO9TTFlDims.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO83TVlMimuQpw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO83TVlNimuQpw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO83TVlDims.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8rTllMimuQpw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8rTllNimuQpw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8rTllDims.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8PT1lMimuQpw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8PT1lNimuQpw.woff2',
				latin:
					'https://fonts.gstatic.com/s/asapcondensed/v17/pxieypY1o9NHyXh3WvSbGSggdO8PT1lDims.woff2',
			},
		},
	},
});

export const fontFamily = 'Asap Condensed' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
