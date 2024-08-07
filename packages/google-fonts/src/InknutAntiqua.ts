import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Inknut Antiqua',
	importName: 'InknutAntiqua',
	version: 'v14',
	url: 'https://fonts.googleapis.com/css2?family=Inknut+Antiqua:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		devanagari:
			'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				devanagari:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2vwoj_Zhs4YA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2vwojwZhs4YA.woff2',
				latin:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2vwoj-Zhs.woff2',
			},
			'400': {
				devanagari:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GSYax7VC4ot_qNB4nYpBdaKUUF4J3BRw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GSYax7VC4ot_qNB4nYpBdaKUUK4J3BRw.woff2',
				latin:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GSYax7VC4ot_qNB4nYpBdaKUUE4J0.woff2',
			},
			'500': {
				devanagari:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU33w4j_Zhs4YA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU33w4jwZhs4YA.woff2',
				latin:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU33w4j-Zhs.woff2',
			},
			'600': {
				devanagari:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU3bxIj_Zhs4YA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU3bxIjwZhs4YA.woff2',
				latin:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU3bxIj-Zhs.woff2',
			},
			'700': {
				devanagari:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2_xYj_Zhs4YA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2_xYjwZhs4YA.woff2',
				latin:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2_xYj-Zhs.woff2',
			},
			'800': {
				devanagari:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2jxoj_Zhs4YA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2jxojwZhs4YA.woff2',
				latin:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2jxoj-Zhs.woff2',
			},
			'900': {
				devanagari:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2Hx4j_Zhs4YA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2Hx4jwZhs4YA.woff2',
				latin:
					'https://fonts.gstatic.com/s/inknutantiqua/v14/Y4GRYax7VC4ot_qNB4nYpBdaKU2Hx4j-Zhs.woff2',
			},
		},
	},
});

export const fontFamily = 'Inknut Antiqua' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'devanagari' | 'latin' | 'latin-ext';
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
