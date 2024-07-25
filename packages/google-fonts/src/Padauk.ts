import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Padauk',
	importName: 'Padauk',
	version: 'v16',
	url: 'https://fonts.googleapis.com/css2?family=Padauk:ital,wght@0,400;0,700',
	unicodeRanges: {
		myanmar:
			'U+1000-109F, U+200C-200D, U+25CC, U+A92E, U+A9E0-A9FE, U+AA60-AA7F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				myanmar:
					'https://fonts.gstatic.com/s/padauk/v16/RrQRboJg-id7OnbxckXh7Lk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/padauk/v16/RrQRboJg-id7OnbxYkXh7Lk.woff2',
				latin:
					'https://fonts.gstatic.com/s/padauk/v16/RrQRboJg-id7OnbxbEXh.woff2',
			},
			'700': {
				myanmar:
					'https://fonts.gstatic.com/s/padauk/v16/RrQSboJg-id7Onb512D0zZhFV4Y.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/padauk/v16/RrQSboJg-id7Onb512D03ZhFV4Y.woff2',
				latin:
					'https://fonts.gstatic.com/s/padauk/v16/RrQSboJg-id7Onb512D005hF.woff2',
			},
		},
	},
});

export const fontFamily = 'Padauk' as const;

type Variants = {
	normal: {
		weights: '400' | '700';
		subsets: 'latin' | 'latin-ext' | 'myanmar';
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
