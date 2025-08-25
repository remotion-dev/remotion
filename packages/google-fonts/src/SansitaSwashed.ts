import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Sansita Swashed',
	importName: 'SansitaSwashed',
	version: 'v22',
	url: 'https://fonts.googleapis.com/css2?family=Sansita+Swashed:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3b2zkRk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3L2zkRk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH0r2z.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3b2zkRk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3L2zkRk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH0r2z.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3b2zkRk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3L2zkRk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH0r2z.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3b2zkRk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3L2zkRk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH0r2z.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3b2zkRk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3L2zkRk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH0r2z.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3b2zkRk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3L2zkRk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH0r2z.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3b2zkRk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH3L2zkRk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansitaswashed/v22/BXRzvFfZifTZgFlDDLgNkBydPKTH0r2z.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'vietnamese'],
});

export const fontFamily = 'Sansita Swashed' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
