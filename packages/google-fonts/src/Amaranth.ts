import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Amaranth',
	importName: 'Amaranth',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Amaranth:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/amaranth/v18/KtkoALODe433f0j1zMnALdKCxg.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/amaranth/v18/KtkrALODe433f0j1zMnAJWmn02P3Eg.woff2',
			},
		},
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/amaranth/v18/KtkuALODe433f0j1zMnFHdA.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/amaranth/v18/KtkpALODe433f0j1zMF-OMWl42E.woff2',
			},
		},
	},
});

export const fontFamily = 'Amaranth' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'latin';
	};
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
