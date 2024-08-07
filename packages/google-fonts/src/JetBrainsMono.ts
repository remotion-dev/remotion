import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'JetBrains Mono',
	importName: 'JetBrainsMono',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwenSHrV.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwCnSHrV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwynSHrV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw2nSHrV.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD2OwG_TA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD_OwG_TA.woff2',
				greek:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD4OwG_TA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD0OwG_TA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD1OwG_TA.woff2',
				latin:
					'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2',
			},
		},
	},
});

export const fontFamily = 'JetBrains Mono' as const;

type Variants = {
	italic: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
