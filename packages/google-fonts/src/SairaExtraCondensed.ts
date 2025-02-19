import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Saira Extra Condensed',
	importName: 'SairaExtraCondensed',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Saira+Extra+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFsOHYr-vcC7h8MklGBkrvmUG9rbpkisrTri3j5_C9csw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFsOHYr-vcC7h8MklGBkrvmUG9rbpkisrTri3j4_C9csw.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFsOHYr-vcC7h8MklGBkrvmUG9rbpkisrTri3j2_C8.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrJ2nh1Aphim8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrJ2nh1Qphim8.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrJ2nh2wph.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrQ2rh1Aphim8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrQ2rh1Qphim8.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrQ2rh2wph.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFiOHYr-vcC7h8MklGBkrvmUG9rbpkisrTj50j05Cs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFiOHYr-vcC7h8MklGBkrvmUG9rbpkisrTj5kj05Cs.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFiOHYr-vcC7h8MklGBkrvmUG9rbpkisrTj6Ej0.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrG2vh1Aphim8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrG2vh1Qphim8.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrG2vh2wph.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrN2zh1Aphim8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrN2zh1Qphim8.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrN2zh2wph.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrU23h1Aphim8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrU23h1Qphim8.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrU23h2wph.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrT27h1Aphim8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrT27h1Qphim8.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTrT27h2wph.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTra2_h1Aphim8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTra2_h1Qphim8.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairaextracondensed/v13/-nFvOHYr-vcC7h8MklGBkrvmUG9rbpkisrTra2_h2wph.woff2',
			},
		},
	},
});

export const fontFamily = 'Saira Extra Condensed' as const;

type Variants = {
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
