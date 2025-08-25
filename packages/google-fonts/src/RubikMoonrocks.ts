import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Rubik Moonrocks',
	importName: 'RubikMoonrocks',
	version: 'v6',
	url: 'https://fonts.googleapis.com/css2?family=Rubik+Moonrocks:ital,wght@0,400',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		hebrew:
			'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubikmoonrocks/v6/845ANMAmAI2VUZMLu_W0M7HqlDHXV8r6FGw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubikmoonrocks/v6/845ANMAmAI2VUZMLu_W0M7HqlDHXXsr6FGw.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubikmoonrocks/v6/845ANMAmAI2VUZMLu_W0M7HqlDHXWMr6FGw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubikmoonrocks/v6/845ANMAmAI2VUZMLu_W0M7HqlDHXVMr6FGw.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubikmoonrocks/v6/845ANMAmAI2VUZMLu_W0M7HqlDHXWsr6.woff2',
			},
		},
	},
	subsets: ['cyrillic', 'cyrillic-ext', 'hebrew', 'latin', 'latin-ext'],
});

export const fontFamily = 'Rubik Moonrocks' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'hebrew' | 'latin' | 'latin-ext';
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
