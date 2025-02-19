import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Overlock',
	importName: 'Overlock',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Overlock:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/overlock/v17/Z9XTDmdMWRiN1_T9Z7Tc2OCsk4GC.woff2',
				latin:
					'https://fonts.gstatic.com/s/overlock/v17/Z9XTDmdMWRiN1_T9Z7Tc2O6skw.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/overlock/v17/Z9XQDmdMWRiN1_T9Z7Tc0FWJhrCj8RLT.woff2',
				latin:
					'https://fonts.gstatic.com/s/overlock/v17/Z9XQDmdMWRiN1_T9Z7Tc0FWJhr6j8Q.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/overlock/v17/Z9XQDmdMWRiN1_T9Z7Tc0G2LhrCj8RLT.woff2',
				latin:
					'https://fonts.gstatic.com/s/overlock/v17/Z9XQDmdMWRiN1_T9Z7Tc0G2Lhr6j8Q.woff2',
			},
		},
		normal: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/overlock/v17/Z9XVDmdMWRiN1_T9Z7TX6Oy0lw.woff2',
				latin:
					'https://fonts.gstatic.com/s/overlock/v17/Z9XVDmdMWRiN1_T9Z7TZ6Ow.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/overlock/v17/Z9XSDmdMWRiN1_T9Z7xizfmFtry79Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/overlock/v17/Z9XSDmdMWRiN1_T9Z7xizfmLtrw.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/overlock/v17/Z9XSDmdMWRiN1_T9Z7xaz_mFtry79Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/overlock/v17/Z9XSDmdMWRiN1_T9Z7xaz_mLtrw.woff2',
			},
		},
	},
});

export const fontFamily = 'Overlock' as const;

type Variants = {
	italic: {
		weights: '400' | '700' | '900';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '700' | '900';
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
