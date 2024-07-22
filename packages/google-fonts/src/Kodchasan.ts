import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kodchasan',
	importName: 'Kodchasan',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Kodchasan:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700',
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
		italic: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlIgNC_9ec-oA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlIgNCk9ec-oA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlIgNCl9ec-oA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlIgNCr9ec.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUksg9C_9ec-oA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUksg9Ck9ec-oA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUksg9Cl9ec-oA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUksg9Cr9ec.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cX3aUPOAJv9sG4I-DJWjUGTocWU1A.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX3aUPOAJv9sG4I-DJWjUGIocWU1A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX3aUPOAJv9sG4I-DJWjUGJocWU1A.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX3aUPOAJv9sG4I-DJWjUGHocU.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUl0gtC_9ec-oA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUl0gtCk9ec-oA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUl0gtCl9ec-oA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUl0gtCr9ec.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlYhdC_9ec-oA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlYhdCk9ec-oA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlYhdCl9ec-oA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUlYhdCr9ec.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUk8hNC_9ec-oA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUk8hNCk9ec-oA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUk8hNCl9ec-oA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXqaUPOAJv9sG4I-DJWjUk8hNCr9ec.woff2',
			},
		},
		normal: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeR1CQkuCp7eM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeR1CQieCp7eM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeR1CQiOCp7eM.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeR1CQhuCp.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeI1OQkuCp7eM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeI1OQieCp7eM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeI1OQiOCp7eM.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeI1OQhuCp.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cXxaUPOAJv9sG4I-DJWnHGFucE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXxaUPOAJv9sG4I-DJWh3GFucE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXxaUPOAJv9sG4I-DJWhnGFucE.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cXxaUPOAJv9sG4I-DJWiHGF.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJee1KQkuCp7eM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJee1KQieCp7eM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJee1KQiOCp7eM.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJee1KQhuCp.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeV1WQkuCp7eM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeV1WQieCp7eM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeV1WQiOCp7eM.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeV1WQhuCp.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeM1SQkuCp7eM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeM1SQieCp7eM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeM1SQiOCp7eM.woff2',
				latin:
					'https://fonts.gstatic.com/s/kodchasan/v17/1cX0aUPOAJv9sG4I-DJeM1SQhuCp.woff2',
			},
		},
	},
});

export const fontFamily = 'Kodchasan' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
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
