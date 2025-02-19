import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Encode Sans Semi Expanded',
	importName: 'EncodeSansSemiExpanded',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Encode+Sans+Semi+Expanded:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
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
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8xOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM-4FIwDkGXc.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8xOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM-4FIgDkGXc.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8xOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM-4FLADk.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM0IUOyjBJE6X.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM0IUOynBJE6X.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM0IUOyfBJA.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMyYXOyjBJE6X.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMyYXOynBJE6X.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMyYXOyfBJA.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke83OhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TO4I1Lhjg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke83OhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TO4M1Lhjg.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke83OhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TO401Lg.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM34WOyjBJE6X.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM34WOynBJE6X.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM34WOyfBJA.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM1IROyjBJE6X.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM1IROynBJE6X.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TM1IROyfBJA.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMzYQOyjBJE6X.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMzYQOynBJE6X.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMzYQOyfBJA.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMyoTOyjBJE6X.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMyoTOynBJE6X.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMyoTOyfBJA.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMw4SOyjBJE6X.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMw4SOynBJE6X.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemiexpanded/v19/ke8yOhAPMEZs-BDuzwftTNJ85JvwMOzE9d9Cca5TMw4SOyfBJA.woff2',
			},
		},
	},
});

export const fontFamily = 'Encode Sans Semi Expanded' as const;

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
