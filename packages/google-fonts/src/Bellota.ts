import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Bellota',
	importName: 'Bellota',
	version: 'v16',
	url: 'https://fonts.googleapis.com/css2?family=Bellota:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
	unicodeRanges: {
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				cyrillic:
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjHGEvjpFLlXs.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjHGEvhZFLlXs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjHGEvhJFLlXs.woff2',
				latin:
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjHGEvipFL.woff2',
			},
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/bellota/v16/MwQ0bhXl3_qEpiwAKJBrs0M6tbA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bellota/v16/MwQ0bhXl3_qEpiwAKJBruEM6tbA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bellota/v16/MwQ0bhXl3_qEpiwAKJBruUM6tbA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bellota/v16/MwQ0bhXl3_qEpiwAKJBrt0M6.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjDGYvjpFLlXs.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjDGYvhZFLlXs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjDGYvhJFLlXs.woff2',
				latin:
					'https://fonts.gstatic.com/s/bellota/v16/MwQxbhXl3_qEpiwAKJBjDGYvipFL.woff2',
			},
		},
		normal: {
			'300': {
				cyrillic:
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAID55oGAfiIlP.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAID55oGsfiIlP.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAID55oGofiIlP.woff2',
				latin:
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAID55oGQfiA.woff2',
			},
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/bellota/v16/MwQ2bhXl3_qEpiwAKJFbtVs-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bellota/v16/MwQ2bhXl3_qEpiwAKJpbtVs-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bellota/v16/MwQ2bhXl3_qEpiwAKJtbtVs-.woff2',
				latin:
					'https://fonts.gstatic.com/s/bellota/v16/MwQ2bhXl3_qEpiwAKJVbtQ.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAIC5-oGAfiIlP.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAIC5-oGsfiIlP.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAIC5-oGofiIlP.woff2',
				latin:
					'https://fonts.gstatic.com/s/bellota/v16/MwQzbhXl3_qEpiwAIC5-oGQfiA.woff2',
			},
		},
	},
});

export const fontFamily = 'Bellota' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '700';
		subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '700';
		subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
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
