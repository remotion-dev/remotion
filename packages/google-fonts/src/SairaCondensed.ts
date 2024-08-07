import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Saira Condensed',
	importName: 'SairaCondensed',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Saira+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
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
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRMQgErUN8XuHNEtX81i9TmEkrnwdtI0Iiirw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRMQgErUN8XuHNEtX81i9TmEkrnwdtJ0Iiirw.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRMQgErUN8XuHNEtX81i9TmEkrnwdtH0Ig.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnbcpQ-K2fli0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnbcpQ-a2fli0.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnbcpQ962f.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnCclQ-K2fli0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnCclQ-a2fli0.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnCclQ962f.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJROQgErUN8XuHNEtX81i9TmEkrvretFyIw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJROQgErUN8XuHNEtX81i9TmEkrvrOtFyIw.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJROQgErUN8XuHNEtX81i9TmEkrvoutF.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnUchQ-K2fli0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnUchQ-a2fli0.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnUchQ962f.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnfc9Q-K2fli0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnfc9Q-a2fli0.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnfc9Q962f.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnGc5Q-K2fli0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnGc5Q-a2fli0.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnGc5Q962f.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnBc1Q-K2fli0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnBc1Q-a2fli0.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnBc1Q962f.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnIcxQ-K2fli0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnIcxQ-a2fli0.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairacondensed/v11/EJRLQgErUN8XuHNEtX81i9TmEkrnIcxQ962f.woff2',
			},
		},
	},
});

export const fontFamily = 'Saira Condensed' as const;

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
