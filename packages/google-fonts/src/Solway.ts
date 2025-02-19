import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Solway',
	importName: 'Solway',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Solway:ital,wght@0,300;0,400;0,500;0,700;0,800',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/solway/v18/AMOTz46Cs2uTAOCuLlgpnccR.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/solway/v18/AMOQz46Cs2uTAOCmhXo8.woff2',
			},
			'500': {
				latin:
					'https://fonts.gstatic.com/s/solway/v18/AMOTz46Cs2uTAOCudlkpnccR.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/solway/v18/AMOTz46Cs2uTAOCuPl8pnccR.woff2',
			},
			'800': {
				latin:
					'https://fonts.gstatic.com/s/solway/v18/AMOTz46Cs2uTAOCuIlwpnccR.woff2',
			},
		},
	},
});

export const fontFamily = 'Solway' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '700' | '800';
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
