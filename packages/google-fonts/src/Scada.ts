import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Scada',
	importName: 'Scada',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Scada:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLp_K5Pv5qumeVJq_TsAamvv.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/scada/v15/RLp_K5Pv5qumeVJq_TIAamvv.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLp_K5Pv5qumeVJq_TgAamvv.woff2',
				latin:
					'https://fonts.gstatic.com/s/scada/v15/RLp_K5Pv5qumeVJq_TYAag.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLp6K5Pv5qumeVJq9Y0lf1nOYME5.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/scada/v15/RLp6K5Pv5qumeVJq9Y0lf1DOYME5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLp6K5Pv5qumeVJq9Y0lf1rOYME5.woff2',
				latin:
					'https://fonts.gstatic.com/s/scada/v15/RLp6K5Pv5qumeVJq9Y0lf1TOYA.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLpxK5Pv5qumeVJizTQYbg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/scada/v15/RLpxK5Pv5qumeVJrzTQYbg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLpxK5Pv5qumeVJhzTQYbg.woff2',
				latin:
					'https://fonts.gstatic.com/s/scada/v15/RLpxK5Pv5qumeVJvzTQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLp8K5Pv5qumeVrU6CEqT1bWZA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/scada/v15/RLp8K5Pv5qumeVrU6CEjT1bWZA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/scada/v15/RLp8K5Pv5qumeVrU6CEpT1bWZA.woff2',
				latin:
					'https://fonts.gstatic.com/s/scada/v15/RLp8K5Pv5qumeVrU6CEnT1Y.woff2',
			},
		},
	},
});

export const fontFamily = 'Scada' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext';
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
