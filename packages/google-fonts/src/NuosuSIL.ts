import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Nuosu SIL',
	importName: 'NuosuSIL',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Nuosu+SIL:ital,wght@0,400',
	unicodeRanges: {
		yi: 'U+02C7, U+02D8-02D9, U+02DB, U+03C0, U+200C-200D, U+2010-2011, U+202F, U+2219, U+2460-2473, U+25CC, U+3000-3003, U+3005, U+3008-301B, U+30FB, U+A000-A48C, U+A490-A4C6, U+FE00, U+FF01-FF02, U+FF08-FF09, U+FF0C, U+FF0E-FF0F, U+FF1A-FF1B, U+FF1F, U+FF3B, U+FF3D, U+FF5B-FF5E, U+FF61-FF65',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				yi: 'https://fonts.gstatic.com/s/nuosusil/v10/8vIK7wM3wmRn_kc4uAjuMmZaC_w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/nuosusil/v10/8vIK7wM3wmRn_kc4uAjuHWZaC_w.woff2',
				latin:
					'https://fonts.gstatic.com/s/nuosusil/v10/8vIK7wM3wmRn_kc4uAjuE2Za.woff2',
			},
		},
	},
});

export const fontFamily = 'Nuosu SIL' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'yi';
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
