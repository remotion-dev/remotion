import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Encode Sans Semi Condensed',
	importName: 'EncodeSansSemiCondensed',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Encode+Sans+Semi+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
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
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT6oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1T1xMlnQujp.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT6oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1T1xMhnQujp.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT6oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1T1xMZnQg.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1RZ1dFPZ9XQTA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1RZ1dFOZ9XQTA.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1RZ1dFAZ9U.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Q91tFPZ9XQTA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Q91tFOZ9XQTA.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Q91tFAZ9U.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT4oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1yZ9MR_Rg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT4oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1yY9MR_Rg.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT4oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1yW9MQ.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Rl19FPZ9XQTA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Rl19FOZ9XQTA.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Rl19FAZ9U.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1RJ0NFPZ9XQTA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1RJ0NFOZ9XQTA.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1RJ0NFAZ9U.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Qt0dFPZ9XQTA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Qt0dFOZ9XQTA.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Qt0dFAZ9U.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Qx0tFPZ9XQTA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Qx0tFOZ9XQTA.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1Qx0tFAZ9U.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1QV09FPZ9XQTA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1QV09FOZ9XQTA.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanssemicondensed/v10/3qT7oiKqnDuUtQUEHMoXcmspmy55SFWrXFRp9FTOG1QV09FAZ9U.woff2',
			},
		},
	},
});

export const fontFamily = 'Encode Sans Semi Condensed' as const;

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
