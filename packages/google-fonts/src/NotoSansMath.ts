import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Math',
	importName: 'NotoSansMath',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Math:ital,wght@0,400',
	unicodeRanges: {
		math: 'U+0302-0303, U+0305, U+0307-0308, U+0330, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2034-2037, U+2057, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2102, U+210A-210E, U+2110-2112, U+2115, U+2119-211D, U+2124, U+2128, U+212C-212D, U+212F-2131, U+2133-2138, U+213C-2140, U+2145-2149, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B6, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				math: 'https://fonts.gstatic.com/s/notosansmath/v15/7Aump_cpkSecTWaHRlH2hyV5UEl981w.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Math' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'math';
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
