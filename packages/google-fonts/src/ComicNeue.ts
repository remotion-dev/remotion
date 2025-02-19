import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Comic Neue',
	importName: 'ComicNeue',
	version: 'v8',
	url: 'https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/comicneue/v8/4UaarEJDsxBrF37olUeD96_RTplkLCND.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/comicneue/v8/4UaFrEJDsxBrF37olUeD96_Z5btx.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/comicneue/v8/4UaarEJDsxBrF37olUeD96_RXp5kLCND.woff2',
			},
		},
		normal: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/comicneue/v8/4UaErEJDsxBrF37olUeD_wHL8pxULg.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/comicneue/v8/4UaHrEJDsxBrF37olUeD96rp5w.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/comicneue/v8/4UaErEJDsxBrF37olUeD_xHM8pxULg.woff2',
			},
		},
	},
});

export const fontFamily = 'Comic Neue' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '700';
		subsets: 'latin';
	};
	normal: {
		weights: '300' | '400' | '700';
		subsets: 'latin';
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
