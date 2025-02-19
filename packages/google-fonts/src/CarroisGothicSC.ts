import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Carrois Gothic SC',
	importName: 'CarroisGothicSC',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Carrois+Gothic+SC:ital,wght@0,400',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/carroisgothicsc/v15/ZgNJjOVHM6jfUZCmyUqT2A2HVKjc-18gPnc.woff2',
			},
		},
	},
});

export const fontFamily = 'Carrois Gothic SC' as const;

type Variants = {
	normal: {
		weights: '400';
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
