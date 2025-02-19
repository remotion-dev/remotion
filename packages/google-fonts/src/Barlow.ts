import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Barlow',
	importName: 'Barlow',
	version: 'v12',
	url: 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHtv4kjgoGqM7E_CfNY8HIJmAci.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHtv4kjgoGqM7E_CfNY8HMJmAci.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHtv4kjgoGqM7E_CfNY8H0JmA.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfP04WohvTobdw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfP04WogvTobdw.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfP04WouvTo.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOQ4mohvTobdw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOQ4mogvTobdw.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOQ4mouvTo.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E_Cfs0wH8RnA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E_Cfs1wH8RnA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E_Cfs7wH8.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfPI42ohvTobdw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfPI42ogvTobdw.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfPI42ouvTo.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfPk5GohvTobdw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfPk5GogvTobdw.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfPk5GouvTo.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOA5WohvTobdw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOA5WogvTobdw.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOA5WouvTo.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOc5mohvTobdw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOc5mogvTobdw.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfOc5mouvTo.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfO452ohvTobdw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfO452ogvTobdw.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHsv4kjgoGqM7E_CfO452ouvTo.woff2',
			},
		},
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E3b_s0wH8RnA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E3b_s1wH8RnA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E3b_s7wH8.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3w-os6FospT4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3w-os6VospT4.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3w-os51os.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3p-ks6FospT4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3p-ks6VospT4.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3p-ks51os.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_A8s52Hs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_Ass52Hs.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_DMs5.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3_-gs6FospT4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3_-gs6VospT4.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3_-gs51os.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E30-8s6FospT4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E30-8s6VospT4.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E30-8s51os.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3t-4s6FospT4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3t-4s6VospT4.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3t-4s51os.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3q-0s6FospT4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3q-0s6VospT4.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3q-0s51os.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3j-ws6FospT4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3j-ws6VospT4.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlow/v12/7cHqv4kjgoGqM7E3j-ws51os.woff2',
			},
		},
	},
});

export const fontFamily = 'Barlow' as const;

type Variants = {
	italic: {
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
