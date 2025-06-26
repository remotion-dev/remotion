import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Gidugu',
	importName: 'Gidugu',
	version: 'v27',
	url: 'https://fonts.googleapis.com/css2?family=Gidugu:ital,wght@0,400',
	unicodeRanges: {
		telugu:
			'U+0951-0952, U+0964-0965, U+0C00-0C7F, U+1CDA, U+1CF2, U+200C-200D, U+25CC',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				telugu:
					'https://fonts.gstatic.com/s/gidugu/v27/L0x8DFMkk1Uf6w3hp_qndSk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/gidugu/v27/L0x8DFMkk1Uf6w3htfqndSk.woff2',
				latin:
					'https://fonts.gstatic.com/s/gidugu/v27/L0x8DFMkk1Uf6w3hu_qn.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'telugu'],
});

export const fontFamily = 'Gidugu' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'telugu';
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
