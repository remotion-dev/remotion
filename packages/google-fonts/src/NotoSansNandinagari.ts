import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Nandinagari',
	importName: 'NotoSansNandinagari',
	version: 'v4',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Nandinagari:ital,wght@0,400',
	unicodeRanges: {
		nandinagari:
			'U+0964-0965, U+0CE6-0CEF, U+1CE9, U+1CF2, U+1CFA, U+A830-A835, U+119A0-119A7, U+119AA-119D7, U+119DA-119E4',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				nandinagari:
					'https://fonts.gstatic.com/s/notosansnandinagari/v4/or38Q7733eiDljA1IufXSNFT-1KI5y10H4jl279zwRRT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansnandinagari/v4/or38Q7733eiDljA1IufXSNFT-1KI5y10H4jlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansnandinagari/v4/or38Q7733eiDljA1IufXSNFT-1KI5y10H4jlbJ5W.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Nandinagari' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'nandinagari';
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
