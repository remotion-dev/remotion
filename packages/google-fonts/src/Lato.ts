import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Lato',
	importName: 'Lato',
	version: 'v24',
	url: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u-w4BMUTPHjxsIPx-mPCLQ7A.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u-w4BMUTPHjxsIPx-oPCI.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI9w2_FQft1dw.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI9w2_Gwft.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxsAUi-qJCY.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxsAXC-q.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI5wq_FQft1dw.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI5wq_Gwft.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI3wi_FQft1dw.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI3wi_Gwft.woff2',
			},
		},
		normal: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHh30AUi-qJCY.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHh30AXC-q.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwaPGR_p.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwiPGQ.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjxAwXjeu.woff2',
				latin: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwaPGR_p.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwaPGR_p.woff2',
				latin:
					'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwiPGQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Lato' as const;

type Variants = {
	italic: {
		weights: '100' | '300' | '400' | '700' | '900';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '100' | '300' | '400' | '700' | '900';
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
