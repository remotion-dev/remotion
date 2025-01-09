import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Bai Jamjuree',
	importName: 'BaiJamjuree',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Bai+Jamjuree:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		thai: 'U+0E01-0E5B, U+200C-200D, U+25CC',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oGkqoi0yyygA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oGkqo50yyygA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oGkqo40yyygA.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oGkqo20yw.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pikaoi0yyygA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pikao50yyygA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pikao40yyygA.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pikao20yw.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIrapSCOBt_aeQQ7ftydoa8W_Lds78J8g.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIrapSCOBt_aeQQ7ftydoa8W_LGs78J8g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIrapSCOBt_aeQQ7ftydoa8W_LHs78J8g.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIrapSCOBt_aeQQ7ftydoa8W_LJs78.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_o6kKoi0yyygA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_o6kKo50yyygA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_o6kKo40yyygA.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_o6kKo20yw.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oWl6oi0yyygA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oWl6o50yyygA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oWl6o40yyygA.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_oWl6o20yw.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pylqoi0yyygA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pylqo50yyygA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pylqo40yyygA.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIoapSCOBt_aeQQ7ftydoa8W_pylqo20yw.woff2',
			},
		},
		normal: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0kePegJo0yyg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0kePem5o0yyg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0kePempo0yyg.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0kePelJo0.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa09eDegJo0yyg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa09eDem5o0yyg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa09eDempo0yyg.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa09eDelJo0.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDI1apSCOBt_aeQQ7ftydoa8SsLLq7s.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDI1apSCOBt_aeQQ7ftydoa8UcLLq7s.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDI1apSCOBt_aeQQ7ftydoa8UMLLq7s.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDI1apSCOBt_aeQQ7ftydoa8XsLL.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0reHegJo0yyg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0reHem5o0yyg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0reHempo0yyg.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0reHelJo0.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0gebegJo0yyg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0gebem5o0yyg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0gebempo0yyg.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa0gebelJo0.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa05efegJo0yyg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa05efem5o0yyg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa05efempo0yyg.woff2',
				latin:
					'https://fonts.gstatic.com/s/baijamjuree/v11/LDIqapSCOBt_aeQQ7ftydoa05efelJo0.woff2',
			},
		},
	},
});

export const fontFamily = 'Bai Jamjuree' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
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
