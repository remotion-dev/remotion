import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'GFS Neohellenic',
	importName: 'GFSNeohellenic',
	version: 'v27',
	url: 'https://fonts.googleapis.com/css2?family=GFS+Neohellenic:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'greek-ext':
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QITdiDOrfiq0b7R8O1Iw9WLcY5jL5JAy6EjUw.woff2',
				greek:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QITdiDOrfiq0b7R8O1Iw9WLcY5jL5JPy6EjUw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QITdiDOrfiq0b7R8O1Iw9WLcY5jL5JDy6EjUw.woff2',
				latin:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QITdiDOrfiq0b7R8O1Iw9WLcY5jL5JMy6E.woff2',
			},
			'700': {
				'greek-ext':
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIWdiDOrfiq0b7R8O1Iw9WLcY5jL5r37rQQcsBu9w.woff2',
				greek:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIWdiDOrfiq0b7R8O1Iw9WLcY5jL5r37rQfcsBu9w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIWdiDOrfiq0b7R8O1Iw9WLcY5jL5r37rQTcsBu9w.woff2',
				latin:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIWdiDOrfiq0b7R8O1Iw9WLcY5jL5r37rQccsA.woff2',
			},
		},
		normal: {
			'400': {
				'greek-ext':
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIRdiDOrfiq0b7R8O1Iw9WLcY5jJqJO06U.woff2',
				greek:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIRdiDOrfiq0b7R8O1Iw9WLcY5jKaJO06U.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIRdiDOrfiq0b7R8O1Iw9WLcY5jJaJO06U.woff2',
				latin:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIRdiDOrfiq0b7R8O1Iw9WLcY5jKqJO.woff2',
			},
			'700': {
				'greek-ext':
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIUdiDOrfiq0b7R8O1Iw9WLcY5rkYdb4IQeasQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIUdiDOrfiq0b7R8O1Iw9WLcY5rkYdb74QeasQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIUdiDOrfiq0b7R8O1Iw9WLcY5rkYdb44QeasQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/gfsneohellenic/v27/8QIUdiDOrfiq0b7R8O1Iw9WLcY5rkYdb7IQe.woff2',
			},
		},
	},
	subsets: ['greek', 'greek-ext', 'latin', 'vietnamese'],
});

export const fontFamily = 'GFS Neohellenic' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'greek' | 'greek-ext' | 'latin' | 'vietnamese';
	};
	normal: {
		weights: '400' | '700';
		subsets: 'greek' | 'greek-ext' | 'latin' | 'vietnamese';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
