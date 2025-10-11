import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Sunuwar',
	importName: 'NotoSansSunuwar',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sunuwar:ital,wght@0,400',
	unicodeRanges: {
		sunuwar:
			'U+0300-0301, U+0303, U+030D, U+0310, U+032D, U+0331, U+11BC0-11BE1, U+11BF0-11BF9',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				sunuwar:
					'https://fonts.gstatic.com/s/notosanssunuwar/v1/FwZB7_04xUkosG2xJo2gm7nF0DTfhr95kEKpA6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssunuwar/v1/FwZB7_04xUkosG2xJo2gm7nF0DTfhr_KsWeUOg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssunuwar/v1/FwZB7_04xUkosG2xJo2gm7nF0DTfhr_EsWc.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'sunuwar'],
});

export const fontFamily = 'Noto Sans Sunuwar' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'sunuwar';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
