import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Chakra Petch',
	importName: 'ChakraPetch',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700',
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
			'300': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLJQq_T9AIU0g.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLJQq_I9AIU0g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLJQq_J9AIU0g.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLJQq_H9AI.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIfkMapbsEk7TDLdtEz1BwkWmpp2YLr41Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfkMapbsEk7TDLdtEz1BwkWmpptYLr41Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfkMapbsEk7TDLdtEz1BwkWmppsYLr41Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfkMapbsEk7TDLdtEz1BwkWmppiYLo.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpKRQ6_T9AIU0g.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpKRQ6_I9AIU0g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpKRQ6_J9AIU0g.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpKRQ6_H9AI.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpK9RK_T9AIU0g.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpK9RK_I9AIU0g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpK9RK_J9AIU0g.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpK9RK_H9AI.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLZRa_T9AIU0g.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLZRa_I9AIU0g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLZRa_J9AIU0g.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIfnMapbsEk7TDLdtEz1BwkWmpLZRa_H9AI.woff2',
			},
		},
		normal: {
			'300': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeNIh1U5_F7AY.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeNIh1SJ_F7AY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeNIh1SZ_F7AY.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeNIh1R5_F.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MapbsEk7TDLdtEz1BwkWi6pgeL4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MapbsEk7TDLdtEz1BwkWkKpgeL4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MapbsEk7TDLdtEz1BwkWkapgeL4.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MapbsEk7TDLdtEz1BwkWn6pg.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkebIl1U5_F7AY.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkebIl1SJ_F7AY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkebIl1SZ_F7AY.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkebIl1R5_F.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeQI51U5_F7AY.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeQI51SJ_F7AY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeQI51SZ_F7AY.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeQI51R5_F.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeJI91U5_F7AY.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeJI91SJ_F7AY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeJI91SZ_F7AY.woff2',
				latin:
					'https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkeJI91R5_F.woff2',
			},
		},
	},
});

export const fontFamily = 'Chakra Petch' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
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
