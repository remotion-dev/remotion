import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif Dives Akuru',
	importName: 'NotoSerifDivesAkuru',
	version: 'v8',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Dives+Akuru:ital,wght@0,400',
	unicodeRanges: {
		'dives-akuru':
			'U+11900-11906, U+11909, U+1190C-11913, U+11915-11916, U+11918-11935, U+11937-11938, U+1193B-11946, U+11950-11959',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'dives-akuru':
					'https://fonts.gstatic.com/s/notoserifdivesakuru/v8/QldfNSVMqAsHtsJ_TnD3aT03sMgd57ibeeZT2-vj7ohECw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifdivesakuru/v8/QldfNSVMqAsHtsJ_TnD3aT03sMgd57ibeeZT20nCy7V9.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifdivesakuru/v8/QldfNSVMqAsHtsJ_TnD3aT03sMgd57ibeeZT20fCyw.woff2',
			},
		},
	},
	subsets: ['dives-akuru', 'latin', 'latin-ext'],
});

export const fontFamily = 'Noto Serif Dives Akuru' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'dives-akuru' | 'latin' | 'latin-ext';
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
