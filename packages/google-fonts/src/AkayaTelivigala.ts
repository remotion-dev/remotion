import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Akaya Telivigala',
	importName: 'AkayaTelivigala',
	version: 'v22',
	url: 'https://fonts.googleapis.com/css2?family=Akaya+Telivigala:ital,wght@0,400',
	unicodeRanges: {
		telugu:
			'U+0951-0952, U+0964-0965, U+0C00-0C7F, U+1CDA, U+1CF2, U+200C-200D, U+25CC',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				telugu:
					'https://fonts.gstatic.com/s/akayatelivigala/v22/lJwc-oo_iG9wXqU3rCTD395tp0uiTcnXsbH0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/akayatelivigala/v22/lJwc-oo_iG9wXqU3rCTD395tp0uiTdvXsbH0.woff2',
				latin:
					'https://fonts.gstatic.com/s/akayatelivigala/v22/lJwc-oo_iG9wXqU3rCTD395tp0uiTdXXsQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Akaya Telivigala' as const;

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
	},
) => {
	return loadFonts(getInfo(), style, options);
};
