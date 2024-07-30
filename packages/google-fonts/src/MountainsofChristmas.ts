import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Mountains of Christmas',
	importName: 'MountainsofChristmas',
	version: 'v22',
	url: 'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:ital,wght@0,400;0,700',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/mountainsofchristmas/v22/3y9w6a4zcCnn5X0FDyrKi2ZRUBIy8uxoUo7eDNGsMQ.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/mountainsofchristmas/v22/3y9z6a4zcCnn5X0FDyrKi2ZRUBIy8uxoUo7eBGqJJPxIOw.woff2',
			},
		},
	},
});

export const fontFamily = 'Mountains of Christmas' as const;

type Variants = {
	normal: {
		weights: '400' | '700';
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
