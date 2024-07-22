import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Khula',
	importName: 'Khula',
	version: 'v12',
	url: 'https://fonts.googleapis.com/css2?family=Khula:ital,wght@0,300;0,400;0,600;0,700;0,800',
	unicodeRanges: {
		devanagari:
			'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				devanagari:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-ljBvSpi9NXw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-ljBvdpi9NXw.woff2',
				latin:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-ljBvTpi8.woff2',
			},
			'400': {
				devanagari:
					'https://fonts.gstatic.com/s/khula/v12/OpNCnoEOns3V7GcPrg7shw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/khula/v12/OpNCnoEOns3V7GcArg7shw.woff2',
				latin:
					'https://fonts.gstatic.com/s/khula/v12/OpNCnoEOns3V7GcOrg4.woff2',
			},
			'600': {
				devanagari:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G_RihvSpi9NXw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G_Rihvdpi9NXw.woff2',
				latin:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G_RihvTpi8.woff2',
			},
			'700': {
				devanagari:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-1ixvSpi9NXw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-1ixvdpi9NXw.woff2',
				latin:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-1ixvTpi8.woff2',
			},
			'800': {
				devanagari:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-piBvSpi9NXw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-piBvdpi9NXw.woff2',
				latin:
					'https://fonts.gstatic.com/s/khula/v12/OpNPnoEOns3V7G-piBvTpi8.woff2',
			},
		},
	},
});

export const fontFamily = 'Khula' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '600' | '700' | '800';
		subsets: 'devanagari' | 'latin' | 'latin-ext';
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
