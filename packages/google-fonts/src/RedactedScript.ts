import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Redacted Script',
	importName: 'RedactedScript',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Redacted+Script:ital,wght@0,300;0,400;0,700',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/redactedscript/v10/ypvEbXGRglhokR7dcC3d1-R6zmxqHUzlkLg2x7k.woff2',
				latin:
					'https://fonts.gstatic.com/s/redactedscript/v10/ypvEbXGRglhokR7dcC3d1-R6zmxqHUzlnrg2.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/redactedscript/v10/ypvBbXGRglhokR7dcC3d1-R6zmxiuG7woZk.woff2',
				latin:
					'https://fonts.gstatic.com/s/redactedscript/v10/ypvBbXGRglhokR7dcC3d1-R6zmxitm7w.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/redactedscript/v10/ypvEbXGRglhokR7dcC3d1-R6zmxqDUvlkLg2x7k.woff2',
				latin:
					'https://fonts.gstatic.com/s/redactedscript/v10/ypvEbXGRglhokR7dcC3d1-R6zmxqDUvlnrg2.woff2',
			},
		},
	},
});

export const fontFamily = 'Redacted Script' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '700';
		subsets: 'latin' | 'latin-ext';
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
