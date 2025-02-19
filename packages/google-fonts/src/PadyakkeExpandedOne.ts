import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Padyakke Expanded One',
	importName: 'PadyakkeExpandedOne',
	version: 'v6',
	url: 'https://fonts.googleapis.com/css2?family=Padyakke+Expanded+One:ital,wght@0,400',
	unicodeRanges: {
		kannada:
			'U+0951-0952, U+0964-0965, U+0C80-0CF3, U+1CD0, U+1CD2, U+1CDA, U+1CF2, U+1CF4, U+200C-200D, U+20B9, U+25CC, U+A830-A835',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				kannada:
					'https://fonts.gstatic.com/s/padyakkeexpandedone/v6/K2FvfY9El_tbR0JfHb6WWvrBaU6XAUvC4IAoJa5llDg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/padyakkeexpandedone/v6/K2FvfY9El_tbR0JfHb6WWvrBaU6XAUvC4IAoMa5llDg.woff2',
				latin:
					'https://fonts.gstatic.com/s/padyakkeexpandedone/v6/K2FvfY9El_tbR0JfHb6WWvrBaU6XAUvC4IAoP65l.woff2',
			},
		},
	},
});

export const fontFamily = 'Padyakke Expanded One' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'kannada' | 'latin' | 'latin-ext';
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
