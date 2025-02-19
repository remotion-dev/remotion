import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Handjet',
	importName: 'Handjet',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Handjet:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		arabic:
			'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0898-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EFD-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1',
		armenian: 'U+0308, U+0530-058F, U+2010, U+2024, U+25CC, U+FB13-FB17',
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		hebrew: 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
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
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'200': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'300': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'400': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'500': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'600': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'700': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'800': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
			'900': {
				arabic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenU3Fgt0.woff2',
				armenian:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZeiE3Fgt0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelU3Fgt0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZenE3Fgt0.woff2',
				greek:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZem03Fgt0.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemk3Fgt0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZel03Fgt0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZelk3Fgt0.woff2',
				latin:
					'https://fonts.gstatic.com/s/handjet/v19/oY108eXHq7n1OnbQrOY_2FrEwYEMLlcdP1mCtZaLaTutCwcIhGZemE3F.woff2',
			},
		},
	},
});

export const fontFamily = 'Handjet' as const;

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
		subsets:
			| 'arabic'
			| 'armenian'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'hebrew'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
