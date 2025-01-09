import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Zilla Slab',
	importName: 'ZillaSlab',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CVHaZV3B3Taw.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CVHaZWXB3.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa4ZfeM_74wlPZtksIFaj8K8VSMZlE.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa4ZfeM_74wlPZtksIFaj8K_1SM.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CDHeZV3B3Taw.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CDHeZWXB3.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CIHCZV3B3Taw.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CIHCZWXB3.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CRHGZV3B3Taw.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFanZfeM_74wlPZtksIFaj8CRHGZWXB3.woff2',
			},
		},
		normal: {
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYpEY6H2pW2hz.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYpEY6HOpWw.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa6ZfeM_74wlPZtksIFajQ6_UyI.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa6ZfeM_74wlPZtksIFajo6_Q.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYskZ6H2pW2hz.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYskZ6HOpWw.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYuUe6H2pW2hz.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYuUe6HOpWw.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYoEf6H2pW2hz.woff2',
				latin:
					'https://fonts.gstatic.com/s/zillaslab/v11/dFa5ZfeM_74wlPZtksIFYoEf6HOpWw.woff2',
			},
		},
	},
});

export const fontFamily = 'Zilla Slab' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext';
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
