import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Golos Text',
	importName: 'GolosText',
	version: 'v4',
	url: 'https://fonts.googleapis.com/css2?family=Golos+Text:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900',
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
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx58hLxR.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx18hLxR.woff2',
				latin:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExN8hA.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx58hLxR.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx18hLxR.woff2',
				latin:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExN8hA.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx58hLxR.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx18hLxR.woff2',
				latin:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExN8hA.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx58hLxR.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx18hLxR.woff2',
				latin:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExN8hA.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx58hLxR.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx18hLxR.woff2',
				latin:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExN8hA.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx58hLxR.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExd8hLxR.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcEx18hLxR.woff2',
				latin:
					'https://fonts.gstatic.com/s/golostext/v4/q5uCsoe9Lv5t7Meb31EcExN8hA.woff2',
			},
		},
	},
});

export const fontFamily = 'Golos Text' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800' | '900';
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
