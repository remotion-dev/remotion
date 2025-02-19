import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Battambang',
	importName: 'Battambang',
	version: 'v24',
	url: 'https://fonts.googleapis.com/css2?family=Battambang:ital,wght@0,100;0,300;0,400;0,700;0,900',
	unicodeRanges: {
		khmer: 'U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				khmer:
					'https://fonts.gstatic.com/s/battambang/v24/uk-kEGe7raEw-HjkzZabNhGZ6wR1zo8.woff2',
				latin:
					'https://fonts.gstatic.com/s/battambang/v24/uk-kEGe7raEw-HjkzZabNhGZ4AR1.woff2',
			},
			'300': {
				khmer:
					'https://fonts.gstatic.com/s/battambang/v24/uk-lEGe7raEw-HjkzZabNtmL9yhQ87ZK.woff2',
				latin:
					'https://fonts.gstatic.com/s/battambang/v24/uk-lEGe7raEw-HjkzZabNtmL9yNQ8w.woff2',
			},
			'400': {
				khmer:
					'https://fonts.gstatic.com/s/battambang/v24/uk-mEGe7raEw-HjkzZabPnmp4hxx.woff2',
				latin:
					'https://fonts.gstatic.com/s/battambang/v24/uk-mEGe7raEw-HjkzZabPnKp4g.woff2',
			},
			'700': {
				khmer:
					'https://fonts.gstatic.com/s/battambang/v24/uk-lEGe7raEw-HjkzZabNsmM9yhQ87ZK.woff2',
				latin:
					'https://fonts.gstatic.com/s/battambang/v24/uk-lEGe7raEw-HjkzZabNsmM9yNQ8w.woff2',
			},
			'900': {
				khmer:
					'https://fonts.gstatic.com/s/battambang/v24/uk-lEGe7raEw-HjkzZabNvGO9yhQ87ZK.woff2',
				latin:
					'https://fonts.gstatic.com/s/battambang/v24/uk-lEGe7raEw-HjkzZabNvGO9yNQ8w.woff2',
			},
		},
	},
});

export const fontFamily = 'Battambang' as const;

type Variants = {
	normal: {
		weights: '100' | '300' | '400' | '700' | '900';
		subsets: 'khmer' | 'latin';
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
