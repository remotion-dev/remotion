import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Traditional Nushu',
	importName: 'NotoTraditionalNushu',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Traditional+Nushu:ital,wght@0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		nushu: 'U+2003, U+3000, U+3002, U+4E00, U+FE12, U+16FE1, U+1B170-1B2FB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				nushu:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67FzV_Geh6.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0R_Geh6.woff2',
				latin:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0p_GQ.woff2',
			},
			'400': {
				nushu:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67FzV_Geh6.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0R_Geh6.woff2',
				latin:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0p_GQ.woff2',
			},
			'500': {
				nushu:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67FzV_Geh6.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0R_Geh6.woff2',
				latin:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0p_GQ.woff2',
			},
			'600': {
				nushu:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67FzV_Geh6.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0R_Geh6.woff2',
				latin:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0p_GQ.woff2',
			},
			'700': {
				nushu:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67FzV_Geh6.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0R_Geh6.woff2',
				latin:
					'https://fonts.gstatic.com/s/nototraditionalnushu/v17/SZco3EDkJ7q9FaoMPlmF4Su8hlIjoGh5aj67F0p_GQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Traditional Nushu' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'nushu';
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
