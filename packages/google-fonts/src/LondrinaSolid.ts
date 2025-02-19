import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Londrina Solid',
	importName: 'LondrinaSolid',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Londrina+Solid:ital,wght@0,100;0,300;0,400;0,900',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				latin:
					'https://fonts.gstatic.com/s/londrinasolid/v17/flUjRq6sw40kQEJxWNgkLuudGfs9GBEUsA.woff2',
			},
			'300': {
				latin:
					'https://fonts.gstatic.com/s/londrinasolid/v17/flUiRq6sw40kQEJxWNgkLuudGfv1CgYzlZw.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/londrinasolid/v17/flUhRq6sw40kQEJxWNgkLuudGfNeKBM.woff2',
			},
			'900': {
				latin:
					'https://fonts.gstatic.com/s/londrinasolid/v17/flUiRq6sw40kQEJxWNgkLuudGfvdDwYzlZw.woff2',
			},
		},
	},
});

export const fontFamily = 'Londrina Solid' as const;

type Variants = {
	normal: {
		weights: '100' | '300' | '400' | '900';
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
