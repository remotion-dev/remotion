import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Rubik',
	importName: 'Rubik',
	version: 'v28',
	url: 'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		arabic:
			'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0898-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EFD-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1',
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		hebrew: 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXu61F3f.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnX661A.woff2',
			},
			'400': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXu61F3f.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnX661A.woff2',
			},
			'500': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXu61F3f.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnX661A.woff2',
			},
			'600': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXu61F3f.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnX661A.woff2',
			},
			'700': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXu61F3f.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnX661A.woff2',
			},
			'800': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXu61F3f.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnX661A.woff2',
			},
			'900': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXu61F3f.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWEBXyIfDnIV7nEnX661A.woff2',
			},
		},
		normal: {
			'300': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nErXyi0A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nMrXyi0A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nFrXyi0A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nDrXyi0A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nPrXyi0A.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nBrXw.woff2',
			},
			'400': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nErXyi0A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nMrXyi0A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nFrXyi0A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nDrXyi0A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nPrXyi0A.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nBrXw.woff2',
			},
			'500': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nErXyi0A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nMrXyi0A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nFrXyi0A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nDrXyi0A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nPrXyi0A.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nBrXw.woff2',
			},
			'600': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nErXyi0A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nMrXyi0A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nFrXyi0A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nDrXyi0A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nPrXyi0A.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nBrXw.woff2',
			},
			'700': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nErXyi0A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nMrXyi0A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nFrXyi0A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nDrXyi0A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nPrXyi0A.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nBrXw.woff2',
			},
			'800': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nErXyi0A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nMrXyi0A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nFrXyi0A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nDrXyi0A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nPrXyi0A.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nBrXw.woff2',
			},
			'900': {
				arabic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nErXyi0A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nMrXyi0A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nFrXyi0A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nDrXyi0A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nPrXyi0A.woff2',
				latin:
					'https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV7nBrXw.woff2',
			},
		},
	},
});

export const fontFamily = 'Rubik' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets:
			| 'arabic'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'hebrew'
			| 'latin'
			| 'latin-ext';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets:
			| 'arabic'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'hebrew'
			| 'latin'
			| 'latin-ext';
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
