import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Montserrat Alternates',
	importName: 'MontserratAlternates',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
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
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTjWacfw6zH4dthXcyms1lPpC8I_b0juU057p-xEJZj11l4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTjWacfw6zH4dthXcyms1lPpC8I_b0juU057p-xEJ9j11l4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTjWacfw6zH4dthXcyms1lPpC8I_b0juU057p-xEJRj11l4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTjWacfw6zH4dthXcyms1lPpC8I_b0juU057p-xEJVj11l4.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTjWacfw6zH4dthXcyms1lPpC8I_b0juU057p-xEJtj1w.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8dAYxJ8mRBkw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8dAYxA8mRBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8dAYxL8mRBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8dAYxK8mRBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8dAYxE8mQ.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p95AoxJ8mRBkw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p95AoxA8mRBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p95AoxL8mRBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p95AoxK8mRBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p95AoxE8mQ.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU057pffIJl70w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU057pfWIJl70w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU057pfdIJl70w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU057pfcIJl70w.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU057pfSIJk.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8hA4xJ8mRBkw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8hA4xA8mRBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8hA4xL8mRBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8hA4xK8mRBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8hA4xE8mQ.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8NBIxJ8mRBkw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8NBIxA8mRBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8NBIxL8mRBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8NBIxK8mRBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p8NBIxE8mQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9pBYxJ8mRBkw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9pBYxA8mRBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9pBYxL8mRBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9pBYxK8mRBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9pBYxE8mQ.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p91BoxJ8mRBkw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p91BoxA8mRBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p91BoxL8mRBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p91BoxK8mRBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p91BoxE8mQ.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9RB4xJ8mRBkw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9RB4xA8mRBkw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9RB4xL8mRBkw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9RB4xK8mRBkw.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTkWacfw6zH4dthXcyms1lPpC8I_b0juU057p9RB4xE8mQ.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU0xiJffIJl70w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU0xiJfWIJl70w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU0xiJfdIJl70w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU0xiJfcIJl70w.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFThWacfw6zH4dthXcyms1lPpC8I_b0juU0xiJfSIJk.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xJIbFCrxG6mA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xJIbFA7xG6mA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xJIbFCLxG6mA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xJIbFCbxG6mA.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xJIbFB7xG.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xQIXFCrxG6mA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xQIXFA7xG6mA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xQIXFCLxG6mA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xQIXFCbxG6mA.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xQIXFB7xG.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTvWacfw6zH4dthXcyms1lPpC8I_b0juU055qfQOJ0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTvWacfw6zH4dthXcyms1lPpC8I_b0juU0576fQOJ0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTvWacfw6zH4dthXcyms1lPpC8I_b0juU055KfQOJ0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTvWacfw6zH4dthXcyms1lPpC8I_b0juU055afQOJ0.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTvWacfw6zH4dthXcyms1lPpC8I_b0juU0566fQ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xGITFCrxG6mA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xGITFA7xG6mA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xGITFCLxG6mA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xGITFCbxG6mA.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xGITFB7xG.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xNIPFCrxG6mA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xNIPFA7xG6mA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xNIPFCLxG6mA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xNIPFCbxG6mA.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xNIPFB7xG.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xUILFCrxG6mA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xUILFA7xG6mA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xUILFCLxG6mA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xUILFCbxG6mA.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xUILFB7xG.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xTIHFCrxG6mA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xTIHFA7xG6mA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xTIHFCLxG6mA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xTIHFCbxG6mA.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xTIHFB7xG.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xaIDFCrxG6mA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xaIDFA7xG6mA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xaIDFCLxG6mA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xaIDFCbxG6mA.woff2',
				latin:
					'https://fonts.gstatic.com/s/montserratalternates/v17/mFTiWacfw6zH4dthXcyms1lPpC8I_b0juU0xaIDFB7xG.woff2',
			},
		},
	},
});

export const fontFamily = 'Montserrat Alternates' as const;

type Variants = {
	italic: {
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
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
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
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
