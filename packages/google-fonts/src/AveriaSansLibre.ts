import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Averia Sans Libre',
	importName: 'AveriaSansLibre',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Averia+Sans+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/averiasanslibre/v19/ga6caxZG_G5OvCf_rt7FH3B6BHLMEdVLKisSH5DdKg.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/averiasanslibre/v19/ga6RaxZG_G5OvCf_rt7FH3B6BHLMEdVLIoAwCg.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/averiasanslibre/v19/ga6caxZG_G5OvCf_rt7FH3B6BHLMEdVLKjsVH5DdKg.woff2',
			},
		},
		normal: {
			'300': {
				latin:
					'https://fonts.gstatic.com/s/averiasanslibre/v19/ga6SaxZG_G5OvCf_rt7FH3B6BHLMEd3lMJcXL5I.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/averiasanslibre/v19/ga6XaxZG_G5OvCf_rt7FH3B6BHLMEdVOEoI.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/averiasanslibre/v19/ga6SaxZG_G5OvCf_rt7FH3B6BHLMEd31N5cXL5I.woff2',
			},
		},
	},
});

export const fontFamily = 'Averia Sans Libre' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '700';
		subsets: 'latin';
	};
	normal: {
		weights: '300' | '400' | '700';
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
