import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Blinker',
	importName: 'Blinker',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Blinker:ital,wght@0,100;0,200;0,300;0,400;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf_MaFatEE-VTaP_E2RbUEDoIs.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf_MaFatEE-VTaP_E2RY0ED.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_OGAdGgmnbJk.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_OGAdGYmnQ.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_IWDdGgmnbJk.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_IWDdGYmnQ.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf9MaFatEE-VTaP9CChYVkH.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf9MaFatEE-VTaP9C6hYQ.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_PGFdGgmnbJk.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_PGFdGYmnQ.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_JWEdGgmnbJk.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_JWEdGYmnQ.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_ImHdGgmnbJk.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_ImHdGYmnQ.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_K2GdGgmnbJk.woff2',
				latin:
					'https://fonts.gstatic.com/s/blinker/v13/cIf4MaFatEE-VTaP_K2GdGYmnQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Blinker' as const;

type Variants = {
	normal: {
		weights: '100' | '200' | '300' | '400' | '600' | '700' | '800' | '900';
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
