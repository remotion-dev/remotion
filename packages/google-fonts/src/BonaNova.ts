import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Bona Nova',
	importName: 'BonaNova',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Bona+Nova:ital,wght@0,400;0,700;1,400',
	unicodeRanges: {
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
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/bonanova/v10/B50LF7ZCpX7fcHfvIUB5iZJkNKuiLA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/bonanova/v10/B50LF7ZCpX7fcHfvIUB5iZJtNKuiLA.woff2',
				greek:
					'https://fonts.gstatic.com/s/bonanova/v10/B50LF7ZCpX7fcHfvIUB5iZJqNKuiLA.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/bonanova/v10/B50LF7ZCpX7fcHfvIUB5iZJrNKuiLA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bonanova/v10/B50LF7ZCpX7fcHfvIUB5iZJmNKuiLA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bonanova/v10/B50LF7ZCpX7fcHfvIUB5iZJnNKuiLA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bonanova/v10/B50LF7ZCpX7fcHfvIUB5iZJpNKs.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/bonanova/v10/B50NF7ZCpX7fcHfvIUB5gaJrLK8.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/bonanova/v10/B50NF7ZCpX7fcHfvIUB5iKJrLK8.woff2',
				greek:
					'https://fonts.gstatic.com/s/bonanova/v10/B50NF7ZCpX7fcHfvIUB5j6JrLK8.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/bonanova/v10/B50NF7ZCpX7fcHfvIUB5jqJrLK8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bonanova/v10/B50NF7ZCpX7fcHfvIUB5g6JrLK8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bonanova/v10/B50NF7ZCpX7fcHfvIUB5gqJrLK8.woff2',
				latin:
					'https://fonts.gstatic.com/s/bonanova/v10/B50NF7ZCpX7fcHfvIUB5jKJr.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/bonanova/v10/B50IF7ZCpX7fcHfvIUBxN4d-Ho6fFY8.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/bonanova/v10/B50IF7ZCpX7fcHfvIUBxN4d-F46fFY8.woff2',
				greek:
					'https://fonts.gstatic.com/s/bonanova/v10/B50IF7ZCpX7fcHfvIUBxN4d-EI6fFY8.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/bonanova/v10/B50IF7ZCpX7fcHfvIUBxN4d-EY6fFY8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/bonanova/v10/B50IF7ZCpX7fcHfvIUBxN4d-HI6fFY8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bonanova/v10/B50IF7ZCpX7fcHfvIUBxN4d-HY6fFY8.woff2',
				latin:
					'https://fonts.gstatic.com/s/bonanova/v10/B50IF7ZCpX7fcHfvIUBxN4d-E46f.woff2',
			},
		},
	},
});

export const fontFamily = 'Bona Nova' as const;

type Variants = {
	italic: {
		weights: '400';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'hebrew'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '400' | '700';
		subsets:
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
