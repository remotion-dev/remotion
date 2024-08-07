import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Maitree',
	importName: 'Maitree',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Maitree:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		thai: 'U+0E01-0E5B, U+200C-200D, U+25CC',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklhGNaIKivYdh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklhGNaJmivYdh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklhGNaJiivYdh.woff2',
				latin:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklhGNaJaivQ.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklnWOaIKivYdh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklnWOaJmivYdh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklnWOaJiivYdh.woff2',
				latin:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklnWOaJaivQ.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/maitree/v10/MjQGmil5tffhpBrknsqsfamD.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/maitree/v10/MjQGmil5tffhpBrkntGsfamD.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/maitree/v10/MjQGmil5tffhpBrkntCsfamD.woff2',
				latin:
					'https://fonts.gstatic.com/s/maitree/v10/MjQGmil5tffhpBrknt6sfQ.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrkli2PaIKivYdh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrkli2PaJmivYdh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrkli2PaJiivYdh.woff2',
				latin:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrkli2PaJaivQ.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklgGIaIKivYdh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklgGIaJmivYdh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklgGIaJiivYdh.woff2',
				latin:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklgGIaJaivQ.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklmWJaIKivYdh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklmWJaJmivYdh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklmWJaJiivYdh.woff2',
				latin:
					'https://fonts.gstatic.com/s/maitree/v10/MjQDmil5tffhpBrklmWJaJaivQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Maitree' as const;

type Variants = {
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
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
