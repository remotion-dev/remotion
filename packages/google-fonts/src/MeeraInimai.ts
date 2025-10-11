import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Meera Inimai',
	importName: 'MeeraInimai',
	version: 'v14',
	url: 'https://fonts.googleapis.com/css2?family=Meera+Inimai:ital,wght@0,400',
	unicodeRanges: {
		tamil: 'U+0964-0965, U+0B82-0BFA, U+200C-200D, U+20B9, U+25CC',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				tamil:
					'https://fonts.gstatic.com/s/meerainimai/v14/845fNMM5EIqOW5MPuvO3ILeZ7mLCZes.woff2',
				latin:
					'https://fonts.gstatic.com/s/meerainimai/v14/845fNMM5EIqOW5MPuvO3ILeZ-GLC.woff2',
			},
		},
	},
	subsets: ['latin', 'tamil'],
});

export const fontFamily = 'Meera Inimai' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'tamil';
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
