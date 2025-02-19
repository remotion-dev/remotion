import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kulim Park',
	importName: 'KulimPark',
	version: 'v14',
	url: 'https://fonts.googleapis.com/css2?family=Kulim+Park:ital,wght@0,200;0,300;0,400;0,600;0,700;1,200;1,300;1,400;1,600;1,700',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUKa9gaJ0rOjU.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUKa9gZp0r.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUTaxgaJ0rOjU.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUTaxgZp0r.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN59secq3hflz1Uu3IwhFwc6I51Wbw.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN59secq3hflz1Uu3IwhFwc5o51.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUOapgaJ0rOjU.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUOapgZp0r.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUXatgaJ0rOjU.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdNm9secq3hflz1Uu3IwhFwUXatgZp0r.woff2',
			},
		},
		normal: {
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjJYN8adQZIUv.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjJYN8alQZA.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjPIO8adQZIUv.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjPIO8alQZA.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN79secq3hflz1Uu3IwhFcs5JZx.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN79secq3hflz1Uu3IwhFks5A.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjIYI8adQZIUv.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjIYI8alQZA.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjOIJ8adQZIUv.woff2',
				latin:
					'https://fonts.gstatic.com/s/kulimpark/v14/fdN49secq3hflz1Uu3IwjOIJ8alQZA.woff2',
			},
		},
	},
});

export const fontFamily = 'Kulim Park' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '600' | '700';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '200' | '300' | '400' | '600' | '700';
		subsets: 'latin' | 'latin-ext';
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
