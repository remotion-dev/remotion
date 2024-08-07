import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'IBM Plex Sans Devanagari',
	importName: 'IBMPlexSansDevanagari',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Devanagari:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		devanagari:
			'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXB3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HMXj6W8nACA.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXB3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HMXj2W8nACA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXB3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HMXj5W8nACA.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXB3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HMXj3W8k.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HnWngcez9MV0.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HnWngfez9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HnWngcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HnWngfOz9.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H-Wrgcez9MV0.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H-Wrgfez9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H-Wrgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H-WrgfOz9.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXH3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_PX0j1Q80.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXH3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_PU0j1Q80.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXH3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_PXEj1Q80.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXH3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_PUkj1.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HoWvgcez9MV0.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HoWvgfez9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HoWvgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HoWvgfOz9.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HjWzgcez9MV0.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HjWzgfez9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HjWzgcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_HjWzgfOz9.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H6W3gcez9MV0.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H6W3gfez9MV0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H6W3gcuz9MV0.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansdevanagari/v11/XRXA3JCMvG4IDoS9SubXB6W-UX5iehIMBFR2-O_H6W3gfOz9.woff2',
			},
		},
	},
});

export const fontFamily = 'IBM Plex Sans Devanagari' as const;

type Variants = {
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic-ext' | 'devanagari' | 'latin' | 'latin-ext';
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
