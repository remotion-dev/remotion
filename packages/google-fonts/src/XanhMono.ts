import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Xanh Mono',
	importName: 'XanhMono',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Xanh+Mono:ital,wght@0,400;1,400',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/xanhmono/v18/R70ejykVmvKCep-vWhSomjqcdzbBTg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/xanhmono/v18/R70ejykVmvKCep-vWhSomjqddzbBTg.woff2',
				latin:
					'https://fonts.gstatic.com/s/xanhmono/v18/R70ejykVmvKCep-vWhSomjqTdzY.woff2',
			},
		},
		normal: {
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/xanhmono/v18/R70YjykVmvKCep-vWhSokAqRbzI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/xanhmono/v18/R70YjykVmvKCep-vWhSokQqRbzI.woff2',
				latin:
					'https://fonts.gstatic.com/s/xanhmono/v18/R70YjykVmvKCep-vWhSonwqR.woff2',
			},
		},
	},
});

export const fontFamily = 'Xanh Mono' as const;

type Variants = {
	italic: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
