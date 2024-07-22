import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Syriac Eastern',
	importName: 'NotoSansSyriacEastern',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Syriac+Eastern:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		syriac:
			'U+0303-0304, U+0307-0308, U+030A, U+0320, U+0323-0325, U+032D-032E, U+0330-0331, U+060C, U+061B-061C, U+061F, U+0621, U+0640, U+064B-0655, U+0660-066C, U+0670, U+0700-074F, U+0860-086A, U+1DF8, U+1DFA, U+200C-200F, U+25CC, U+2670-2671',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'200': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'300': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'400': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'500': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'600': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'700': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'800': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
			'900': {
				syriac:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUOaUDo90.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSURKUDo90.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssyriaceastern/v1/Noah6Vj_wIWFbTTCrYmvy8AjVU8aslWRHHvRYxSUSqUD.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Syriac Eastern' as const;

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
		subsets: 'latin' | 'latin-ext' | 'syriac';
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
