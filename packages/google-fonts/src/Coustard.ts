import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Coustard',
	importName: 'Coustard',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Coustard:ital,wght@0,400;0,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/coustard/v19/3XFpErgg3YsZ5fqUU-UGt2TeRA.woff2',
				latin:
					'https://fonts.gstatic.com/s/coustard/v19/3XFpErgg3YsZ5fqUU-UIt2Q.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/coustard/v19/3XFuErgg3YsZ5fqUU-2LkHHvZfnk3Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/coustard/v19/3XFuErgg3YsZ5fqUU-2LkHHhZfk.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext'],
});

export const fontFamily = 'Coustard' as const;

type Variants = {
	normal: {
		weights: '400' | '900';
		subsets: 'latin' | 'latin-ext';
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
