import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Walter Turncoat',
	importName: 'WalterTurncoat',
	version: 'v23',
	url: 'https://fonts.googleapis.com/css2?family=Walter+Turncoat:ital,wght@0,400',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/walterturncoat/v23/snfys0Gs98ln43n0d-14ULoToe6LZxec.woff2',
			},
		},
	},
});

export const fontFamily = 'Walter Turncoat' as const;

type Variants = {
	normal: {
		weights: '400';
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
