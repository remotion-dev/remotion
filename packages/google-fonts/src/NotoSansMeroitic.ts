import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Meroitic',
	importName: 'NotoSansMeroitic',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Meroitic:ital,wght@0,400',
	unicodeRanges: {
		meroitic: 'U+205D, U+10980-109B7, U+109BC-109CF, U+109D2-109FF',
		'meroitic-cursive': 'U+109A0-109B7, U+109BC-109CF, U+109D2-109FF',
		'meroitic-hieroglyphs': 'U+10980-1099F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				meroitic:
					'https://fonts.gstatic.com/s/notosansmeroitic/v18/IFS5HfRJndhE3P4b5jnZ3ITPvC6i00Uz7jJSuKY.woff2',
				'meroitic-cursive':
					'https://fonts.gstatic.com/s/notosansmeroitic/v18/IFS5HfRJndhE3P4b5jnZ3ITPvC6i00UzLhN3hZ8k.woff2',
				'meroitic-hieroglyphs':
					'https://fonts.gstatic.com/s/notosansmeroitic/v18/IFS5HfRJndhE3P4b5jnZ3ITPvC6i00UzLxN3hZ8k.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmeroitic/v18/IFS5HfRJndhE3P4b5jnZ3ITPvC6i00UziTJSuKY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmeroitic/v18/IFS5HfRJndhE3P4b5jnZ3ITPvC6i00UzhzJS.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Meroitic' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets:
			| 'latin'
			| 'latin-ext'
			| 'meroitic'
			| 'meroitic-cursive'
			| 'meroitic-hieroglyphs';
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
