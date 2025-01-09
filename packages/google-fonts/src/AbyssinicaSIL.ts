import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Abyssinica SIL',
	importName: 'AbyssinicaSIL',
	version: 'v5',
	url: 'https://fonts.googleapis.com/css2?family=Abyssinica+SIL:ital,wght@0,400',
	unicodeRanges: {
		ethiopic:
			'U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7E6, U+1E7E8-1E7EB, U+1E7ED-1E7EE, U+1E7F0-1E7FE',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				ethiopic:
					'https://fonts.gstatic.com/s/abyssinicasil/v5/oY1H8ezOqK7iI3rK_45WKoc8J5UPDlKlAQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/abyssinicasil/v5/oY1H8ezOqK7iI3rK_45WKoc8J5UQDlKlAQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/abyssinicasil/v5/oY1H8ezOqK7iI3rK_45WKoc8J5UeDlI.woff2',
			},
		},
	},
});

export const fontFamily = 'Abyssinica SIL' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'ethiopic' | 'latin' | 'latin-ext';
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
