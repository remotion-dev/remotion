import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kadwa',
	importName: 'Kadwa',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Kadwa:ital,wght@0,400;0,700',
	unicodeRanges: {
		devanagari:
			'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				devanagari:
					'https://fonts.gstatic.com/s/kadwa/v10/rnCm-x5V0g7ipiTBT8YGsw.woff2',
				latin:
					'https://fonts.gstatic.com/s/kadwa/v10/rnCm-x5V0g7ipiTAT8Y.woff2',
			},
			'700': {
				devanagari:
					'https://fonts.gstatic.com/s/kadwa/v10/rnCr-x5V0g7ipix7atM4knj-SA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kadwa/v10/rnCr-x5V0g7ipix7atM5kng.woff2',
			},
		},
	},
});

export const fontFamily = 'Kadwa' as const;

type Variants = {
	normal: {
		weights: '400' | '700';
		subsets: 'devanagari' | 'latin';
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
