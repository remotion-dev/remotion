import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Tinos',
	importName: 'Tinos',
	version: 'v24',
	url: 'https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		hebrew: 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
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
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmtJ9RI-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmJJ9RI-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmpJ9RI-.woff2',
				greek:
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmVJ9RI-.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmRJ9RI-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmlJ9RI-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmhJ9RI-.woff2',
				latin:
					'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-TmZJ9Q.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4CAf_exL.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4Ckf_exL.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4CEf_exL.woff2',
				greek:
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4C4f_exL.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4C8f_exL.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4CIf_exL.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4CMf_exL.woff2',
				latin:
					'https://fonts.gstatic.com/s/tinos/v24/buEzpoGnedXvwjX-Rt1s4C0f_Q.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX2fmRR8Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX_fmRR8Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX3fmRR8Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX4fmRR8Q.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX5fmRR8Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX0fmRR8Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX1fmRR8Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwjX7fmQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Fj0C8H-Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Fq0C8H-Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Fi0C8H-Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Ft0C8H-Q.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Fs0C8H-Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Fh0C8H-Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Fg0C8H-Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/tinos/v24/buE1poGnedXvwj1AW3Fu0C8.woff2',
			},
		},
	},
});

export const fontFamily = 'Tinos' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'hebrew'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'hebrew'
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
