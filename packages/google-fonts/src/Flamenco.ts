import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Flamenco',
	importName: 'Flamenco',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Flamenco:ital,wght@0,300;0,400',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/flamenco/v18/neIPzCehqYguo67ssZ0qNLk1cJA.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/flamenco/v18/neIIzCehqYguo67ssZWBFqw.woff2',
			},
		},
	},
});

export const fontFamily = 'Flamenco' as const;

type Variants = {
	normal: {
		weights: '300' | '400';
		subsets: 'latin';
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
