import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Cham',
	importName: 'NotoSansCham',
	version: 'v29',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Cham:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		cham: 'U+200C-200D, U+2010, U+25CC, U+AA00-AA5F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'200': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'300': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'400': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'500': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'600': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'700': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'800': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
			'900': {
				cham: 'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5eU1EQVg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5jU1EQVg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscham/v30/pe03MIySN5pO62Z5YkFyQb_bbs5tU1E.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Cham' as const;

type Variants = {
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'cham' | 'latin' | 'latin-ext';
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
