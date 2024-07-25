import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Mukta Vaani',
	importName: 'MuktaVaani',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Mukta+Vaani:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		gujarati:
			'U+0951-0952, U+0964-0965, U+0A80-0AFF, U+200C-200D, U+20B9, U+25CC, U+A830-A839',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'200': {
				gujarati:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXNV_Bf8O5LMQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXNV_BK8O5LMQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXNV_BE8O4.woff2',
			},
			'300': {
				gujarati:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGWpVPBf8O5LMQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGWpVPBK8O5LMQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGWpVPBE8O4.woff2',
			},
			'400': {
				gujarati:
					'https://fonts.gstatic.com/s/muktavaani/v13/3Jn5SD_-ynaxmxnEfVHPIG0ZduV70Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/muktavaani/v13/3Jn5SD_-ynaxmxnEfVHPIG0MduV70Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/muktavaani/v13/3Jn5SD_-ynaxmxnEfVHPIG0CduU.woff2',
			},
			'500': {
				gujarati:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXxVfBf8O5LMQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXxVfBK8O5LMQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXxVfBE8O4.woff2',
			},
			'600': {
				gujarati:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXdUvBf8O5LMQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXdUvBK8O5LMQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGXdUvBE8O4.woff2',
			},
			'700': {
				gujarati:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGW5U_Bf8O5LMQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGW5U_BK8O5LMQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGW5U_BE8O4.woff2',
			},
			'800': {
				gujarati:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGWlUPBf8O5LMQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGWlUPBK8O5LMQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/muktavaani/v13/3JnkSD_-ynaxmxnEfVHPIGWlUPBE8O4.woff2',
			},
		},
	},
});

export const fontFamily = 'Mukta Vaani' as const;

type Variants = {
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'gujarati' | 'latin' | 'latin-ext';
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
