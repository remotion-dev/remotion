import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Winky Sans',
	importName: 'WinkySans',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Winky+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYny4fvRQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYkS4f.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYny4fvRQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYkS4f.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYny4fvRQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYkS4f.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYny4fvRQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYkS4f.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYny4fvRQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYkS4f.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYny4fvRQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYkS4f.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYny4fvRQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll87K2SDUiG1Hpf2p06bN6gYkS4f.woff2',
			},
		},
		normal: {
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN6MokzYb.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN60okw.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN6MokzYb.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN60okw.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN6MokzYb.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN60okw.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN6MokzYb.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN60okw.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN6MokzYb.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN60okw.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN6MokzYb.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN60okw.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN6MokzYb.woff2',
				latin:
					'https://fonts.gstatic.com/s/winkysans/v2/ll85K2SDUiG1Hpf2p06bN60okw.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext'],
});

export const fontFamily = 'Winky Sans' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext';
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
