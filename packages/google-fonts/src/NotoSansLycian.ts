import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Lycian',
	importName: 'NotoSansLycian',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Lycian:ital,wght@0,400',
	unicodeRanges: {
		lycian:
			'U+10280-1029C, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				lycian:
					'https://fonts.gstatic.com/s/notosanslycian/v15/QldVNSNMqAsHtsJ7UmqxBQA9r8wA16TQCQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Lycian' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'lycian';
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
