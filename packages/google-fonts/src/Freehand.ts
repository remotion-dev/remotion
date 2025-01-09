import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Freehand',
	importName: 'Freehand',
	version: 'v31',
	url: 'https://fonts.googleapis.com/css2?family=Freehand:ital,wght@0,400',
	unicodeRanges: {
		khmer: 'U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				khmer:
					'https://fonts.gstatic.com/s/freehand/v31/cIf-Ma5eqk01VjKTgDmNRGQ-mQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/freehand/v31/cIf-Ma5eqk01VjKTgDmGRGQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Freehand' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'khmer' | 'latin';
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
