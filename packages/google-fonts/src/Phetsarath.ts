import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Phetsarath',
	importName: 'Phetsarath',
	version: 'v3',
	url: 'https://fonts.googleapis.com/css2?family=Phetsarath:ital,wght@0,400;0,700',
	unicodeRanges: {
		lao: 'U+0E81-0EDF, U+200C-200D, U+25CC, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				lao: 'https://fonts.gstatic.com/s/phetsarath/v3/N0bQ2SpTP-plK0uWayAYMdD3nA.woff2',
			},
			'700': {
				lao: 'https://fonts.gstatic.com/s/phetsarath/v3/N0bT2SpTP-plK0uWayAYOWLSidnxZA.woff2',
			},
		},
	},
	subsets: ['lao'],
});

export const fontFamily = 'Phetsarath' as const;

type Variants = {
	normal: {
		weights: '400' | '700';
		subsets: 'lao';
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
