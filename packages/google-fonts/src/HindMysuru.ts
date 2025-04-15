import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Hind Mysuru',
	importName: 'HindMysuru',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Hind+Mysuru:ital,wght@0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		kannada:
			'U+0951-0952, U+0964-0965, U+0C80-0CF3, U+1CD0, U+1CD2-1CD3, U+1CDA, U+1CF2, U+1CF4, U+200C-200D, U+20B9, U+25CC, U+A830-A835',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				kannada:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8pppEWND1XaUw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8pppEWZD1XaUw.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8pppEWXD1U.woff2',
			},
			'400': {
				kannada:
					'https://fonts.gstatic.com/s/hindmysuru/v1/syk3-yB3k7wiAJ-U5l_li8LYhlCoLg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmysuru/v1/syk3-yB3k7wiAJ-U5l_li8LMhlCoLg.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmysuru/v1/syk3-yB3k7wiAJ-U5l_li8LChlA.woff2',
			},
			'500': {
				kannada:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8oxpUWND1XaUw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8oxpUWZD1XaUw.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8oxpUWXD1U.woff2',
			},
			'600': {
				kannada:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8odokWND1XaUw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8odokWZD1XaUw.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8odokWXD1U.woff2',
			},
			'700': {
				kannada:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8p5o0WND1XaUw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8p5o0WZD1XaUw.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmysuru/v1/sykq-yB3k7wiAJ-U5l_li8p5o0WXD1U.woff2',
			},
		},
	},
	subsets: ['kannada', 'latin', 'latin-ext'],
});

export const fontFamily = 'Hind Mysuru' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'kannada' | 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
