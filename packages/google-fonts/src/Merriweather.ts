import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Merriweather',
	importName: 'Merriweather',
	version: 'v30',
	url: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900',
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
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXff1jvzRPA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXff8jvzRPA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXff3jvzRPA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXff2jvzRPA.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXff4jvw.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eRZDf-LHrw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eRZKf-LHrw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eRZBf-LHrw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eRZAf-LHrw.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eRZOf-I.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR71Wvf1jvzRPA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR71Wvf8jvzRPA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR71Wvf3jvzRPA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR71Wvf2jvzRPA.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR71Wvf4jvw.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7NWPf1jvzRPA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7NWPf8jvzRPA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7NWPf3jvzRPA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7NWPf2jvzRPA.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7NWPf4jvw.woff2',
			},
		},
		normal: {
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZVcf6lvg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZXMf6lvg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZV8f6lvg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZVsf6lvg.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-cSZMZ-Y.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-eCZMZ-Y.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-cyZMZ-Y.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-ciZMZ-Y.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZM.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZVcf6lvg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZXMf6lvg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZV8f6lvg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZVsf6lvg.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZWMf6.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZVcf6lvg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZXMf6lvg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZV8f6lvg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZVsf6lvg.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZWMf6.woff2',
			},
		},
	},
});

export const fontFamily = 'Merriweather' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '700' | '900';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '700' | '900';
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
