import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'KoHo',
	importName: 'KoHo',
	version: 'v16',
	url: 'https://fonts.googleapis.com/css2?family=KoHo:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700',
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
			'200': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNisssJ_DMaqlPys.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNisssJ_DKqqlPys.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNisssJ_DK6qlPys.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNisssJ_DJaql.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNiss1JzDMaqlPys.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNiss1JzDKqqlPys.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNiss1JzDK6qlPys.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNiss1JzDJaql.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FwfZ5fmddNNiska77WGos.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FwfZ5fmddNNiskcL7WGos.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FwfZ5fmddNNiskcb7WGos.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FwfZ5fmddNNiskf77W.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissjJ3DMaqlPys.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissjJ3DKqqlPys.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissjJ3DK6qlPys.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissjJ3DJaql.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissoJrDMaqlPys.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissoJrDKqqlPys.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissoJrDK6qlPys.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissoJrDJaql.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissxJvDMaqlPys.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissxJvDKqqlPys.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissxJvDK6qlPys.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FzfZ5fmddNNissxJvDJaql.woff2',
			},
		},
		normal: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPuE1aI3zJ7Kh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPuE1aJbzJ7Kh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPuE1aJfzJ7Kh.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPuE1aJnzJw.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPoU2aI3zJ7Kh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPoU2aJbzJ7Kh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPoU2aJfzJ7Kh.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPoU2aJnzJw.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2F-fZ5fmddNNjoUfabS.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2F-fZ5fmddNNiEUfabS.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2F-fZ5fmddNNiAUfabS.woff2',
				latin: 'https://fonts.gstatic.com/s/koho/v16/K2F-fZ5fmddNNi4UfQ.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPt03aI3zJ7Kh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPt03aJbzJ7Kh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPt03aJfzJ7Kh.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPt03aJnzJw.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPvEwaI3zJ7Kh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPvEwaJbzJ7Kh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPvEwaJfzJ7Kh.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPvEwaJnzJw.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPpUxaI3zJ7Kh.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPpUxaJbzJ7Kh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPpUxaJfzJ7Kh.woff2',
				latin:
					'https://fonts.gstatic.com/s/koho/v16/K2FxfZ5fmddNPpUxaJnzJw.woff2',
			},
		},
	},
});

export const fontFamily = 'KoHo' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
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
