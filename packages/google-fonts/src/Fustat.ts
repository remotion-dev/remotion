import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Fustat',
	importName: 'Fustat',
	version: 'v4',
	url: 'https://fonts.googleapis.com/css2?family=Fustat:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		arabic:
			'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC4, U+10EFC-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'200': {
				arabic:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLTfJCkyo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLRvJCkyo.woff2',
				latin:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLSPJC.woff2',
			},
			'300': {
				arabic:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLTfJCkyo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLRvJCkyo.woff2',
				latin:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLSPJC.woff2',
			},
			'400': {
				arabic:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLTfJCkyo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLRvJCkyo.woff2',
				latin:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLSPJC.woff2',
			},
			'500': {
				arabic:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLTfJCkyo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLRvJCkyo.woff2',
				latin:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLSPJC.woff2',
			},
			'600': {
				arabic:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLTfJCkyo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLRvJCkyo.woff2',
				latin:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLSPJC.woff2',
			},
			'700': {
				arabic:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLTfJCkyo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLRvJCkyo.woff2',
				latin:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLSPJC.woff2',
			},
			'800': {
				arabic:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLTfJCkyo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLRvJCkyo.woff2',
				latin:
					'https://fonts.gstatic.com/s/fustat/v4/NaPZcZ_aHO9Iy5tLSPJC.woff2',
			},
		},
	},
	subsets: ['arabic', 'latin', 'latin-ext'],
});

export const fontFamily = 'Fustat' as const;

type Variants = {
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'arabic' | 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
