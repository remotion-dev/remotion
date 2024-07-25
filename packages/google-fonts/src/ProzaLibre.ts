import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Proza Libre',
	importName: 'ProzaLibre',
	version: 'v9',
	url: 'https://fonts.googleapis.com/css2?family=Proza+Libre:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjEdGHgj0k1DIQRyUEyyEotRNb_Xayz.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjEdGHgj0k1DIQRyUEyyEotRNj_XQ.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTCvcSJ2S8g6N.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTCvcSJOS8g.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTAfbSJ2S8g6N.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTAfbSJOS8g.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTGPaSJ2S8g6N.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTGPaSJOS8g.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTH_ZSJ2S8g6N.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjZdGHgj0k1DIQRyUEyyEotTH_ZSJOS8g.woff2',
			},
		},
		normal: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjGdGHgj0k1DIQRyUEyyEomdNrnWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjGdGHgj0k1DIQRyUEyyEoodNo.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyELbV8_WeJGK9g.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyELbV8_YeJE.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyEL3UM_WeJGK9g.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyEL3UM_YeJE.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyEKTUc_WeJGK9g.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyEKTUc_YeJE.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyEKPUs_WeJGK9g.woff2',
				latin:
					'https://fonts.gstatic.com/s/prozalibre/v9/LYjbdGHgj0k1DIQRyUEyyEKPUs_YeJE.woff2',
			},
		},
	},
});

export const fontFamily = 'Proza Libre' as const;

type Variants = {
	italic: {
		weights: '400' | '500' | '600' | '700' | '800';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '500' | '600' | '700' | '800';
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
