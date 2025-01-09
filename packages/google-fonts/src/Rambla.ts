import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Rambla',
	importName: 'Rambla',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Rambla:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/rambla/v13/snfps0ip98hx6mrEIYgDHtxEwQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/rambla/v13/snfps0ip98hx6mrEIYgNHtw.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/rambla/v13/snfus0ip98hx6mrEIYC2O8l14J-jYQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/rambla/v13/snfus0ip98hx6mrEIYC2O8l74J8.woff2',
			},
		},
		normal: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/rambla/v13/snfrs0ip98hx6mrEKrgPBtg.woff2',
				latin:
					'https://fonts.gstatic.com/s/rambla/v13/snfrs0ip98hx6mrEJLgP.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/rambla/v13/snfos0ip98hx6mrMn50aN_l5-Js.woff2',
				latin:
					'https://fonts.gstatic.com/s/rambla/v13/snfos0ip98hx6mrMn50aOfl5.woff2',
			},
		},
	},
});

export const fontFamily = 'Rambla' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '700';
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
