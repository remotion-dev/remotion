import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Jomolhari',
	importName: 'Jomolhari',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Jomolhari:ital,wght@0,400',
	unicodeRanges: {
		tibetan: 'U+0F00-0FFF, U+200C-200D, U+25CC, U+3008-300B',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				tibetan:
					'https://fonts.gstatic.com/s/jomolhari/v20/EvONzA1M1Iw_CBd2hsQyBVgYGq4.woff2',
				latin:
					'https://fonts.gstatic.com/s/jomolhari/v20/EvONzA1M1Iw_CBd2hsQyEFgY.woff2',
			},
		},
	},
	subsets: ['latin', 'tibetan'],
});

export const fontFamily = 'Jomolhari' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'tibetan';
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
