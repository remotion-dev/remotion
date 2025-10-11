import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif Tangut',
	importName: 'NotoSerifTangut',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Tangut:ital,wght@0,400',
	unicodeRanges: {
		tangut:
			'U+2FF0-2FFF, U+31EF, U+16FE0, U+17000-187F7, U+18800-18AFF, U+18D00-18D08',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				tangut:
					'https://fonts.gstatic.com/s/notoseriftangut/v19/xn76YGc72GKoTvER4Gn3b4m9Ern7El6wVu_A4b0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftangut/v19/xn76YGc72GKoTvER4Gn3b4m9Ern7El48d8r92A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftangut/v19/xn76YGc72GKoTvER4Gn3b4m9Ern7El4yd8o.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'tangut'],
});

export const fontFamily = 'Noto Serif Tangut' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'tangut';
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
