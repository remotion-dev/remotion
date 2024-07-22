import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Phags Pa',
	importName: 'NotoSansPhagsPa',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Phags+Pa:ital,wght@0,400',
	unicodeRanges: {
		'phags-pa':
			'U+1801-1803, U+1805, U+200C-200F, U+2025, U+25CC, U+3000-3003, U+3005, U+3007-301B, U+A840-A877, U+FE00, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'phags-pa':
					'https://fonts.gstatic.com/s/notosansphagspa/v15/pxiZyoo6v8ZYyWh5WuPeJzMkd4SrGChUnU6t.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Phags Pa' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'phags-pa';
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
