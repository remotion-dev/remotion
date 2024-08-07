import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Grantha',
	importName: 'NotoSansGrantha',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Grantha:ital,wght@0,400',
	unicodeRanges: {
		grantha:
			'U+0951-0952, U+0964-0965, U+0BAA, U+0BB5, U+0BE6-0BF3, U+1CD0, U+1CD2-1CD3, U+1CF2-1CF4, U+1CF8-1CF9, U+200C-200D, U+20F0, U+25CC, U+11300-1137F, U+11FD0-11FD1, U+11FD3',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				grantha:
					'https://fonts.gstatic.com/s/notosansgrantha/v17/3y976akwcCjmsU8NDyrKo3IQfQ4o-o-cPs-oJNc.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansgrantha/v17/3y976akwcCjmsU8NDyrKo3IQfQ4o-o8VH-qVHQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansgrantha/v17/3y976akwcCjmsU8NDyrKo3IQfQ4o-o8bH-o.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Grantha' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'grantha' | 'latin' | 'latin-ext';
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
