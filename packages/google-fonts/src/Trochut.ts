import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Trochut',
	importName: 'Trochut',
	version: 'v22',
	url: 'https://fonts.googleapis.com/css2?family=Trochut:ital,wght@0,400;0,700;1,400',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/trochut/v22/CHyhV-fDDlP9bDIw1nayfnoL.woff2',
			},
		},
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/trochut/v22/CHyjV-fDDlP9bDIw1nOCfA.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/trochut/v22/CHymV-fDDlP9bDIw3sinaV0uMw.woff2',
			},
		},
	},
});

export const fontFamily = 'Trochut' as const;

type Variants = {
	italic: {
		weights: '400';
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
