import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'GFS Didot',
	importName: 'GFSDidot',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=GFS+Didot:ital,wght@0,400',
	unicodeRanges: {
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				greek:
					'https://fonts.gstatic.com/s/gfsdidot/v16/Jqzh5TybZ9vZMWFssvwSE-3H.woff2',
			},
		},
	},
});

export const fontFamily = 'GFS Didot' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'greek';
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
