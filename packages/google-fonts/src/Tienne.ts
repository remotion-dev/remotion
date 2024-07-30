import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Tienne',
	importName: 'Tienne',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Tienne:ital,wght@0,400;0,700;0,900',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/tienne/v20/AYCKpX7pe9YCRP07l0nG.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/tienne/v20/AYCJpX7pe9YCRP0zLGzTR3Jv.woff2',
			},
			'900': {
				latin:
					'https://fonts.gstatic.com/s/tienne/v20/AYCJpX7pe9YCRP0zFG7TR3Jv.woff2',
			},
		},
	},
});

export const fontFamily = 'Tienne' as const;

type Variants = {
	normal: {
		weights: '400' | '700' | '900';
		subsets: 'latin';
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
