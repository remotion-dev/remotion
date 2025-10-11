import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif Todhri',
	importName: 'NotoSerifTodhri',
	version: 'v3',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Todhri:ital,wght@0,400',
	unicodeRanges: {
		todhri: 'U+0301, U+0304, U+0307, U+0311, U+0313, U+035E, U+105C0-105F3',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				todhri:
					'https://fonts.gstatic.com/s/notoseriftodhri/v3/dFalZeyY-aYz1YVbjMoBWml1nBz7N0DJdI35R2o.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftodhri/v3/dFalZeyY-aYz1YVbjMoBWml1nBz7N0B7VajEfg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftodhri/v3/dFalZeyY-aYz1YVbjMoBWml1nBz7N0B1Vag.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'todhri'],
});

export const fontFamily = 'Noto Serif Todhri' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'todhri';
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
