import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Chathura',
	importName: 'Chathura',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Chathura:ital,wght@0,100;0,300;0,400;0,700;0,800',
	unicodeRanges: {
		telugu:
			'U+0951-0952, U+0964-0965, U+0C00-0C7F, U+1CDA, U+1CF2, U+200C-200D, U+25CC',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				telugu:
					'https://fonts.gstatic.com/s/chathura/v20/_gP91R7-rzUuVjim42dEm1-RT8Zy.woff2',
				latin:
					'https://fonts.gstatic.com/s/chathura/v20/_gP91R7-rzUuVjim42dEm0ORTw.woff2',
			},
			'300': {
				telugu:
					'https://fonts.gstatic.com/s/chathura/v20/_gP81R7-rzUuVjim42eMiVSqavtLoQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/chathura/v20/_gP81R7-rzUuVjim42eMiVS2avs.woff2',
			},
			'400': {
				telugu:
					'https://fonts.gstatic.com/s/chathura/v20/_gP71R7-rzUuVjim4287q0GJSw.woff2',
				latin:
					'https://fonts.gstatic.com/s/chathura/v20/_gP71R7-rzUuVjim428nq0E.woff2',
			},
			'700': {
				telugu:
					'https://fonts.gstatic.com/s/chathura/v20/_gP81R7-rzUuVjim42ecjlSqavtLoQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/chathura/v20/_gP81R7-rzUuVjim42ecjlS2avs.woff2',
			},
			'800': {
				telugu:
					'https://fonts.gstatic.com/s/chathura/v20/_gP81R7-rzUuVjim42eAjVSqavtLoQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/chathura/v20/_gP81R7-rzUuVjim42eAjVS2avs.woff2',
			},
		},
	},
});

export const fontFamily = 'Chathura' as const;

type Variants = {
	normal: {
		weights: '100' | '300' | '400' | '700' | '800';
		subsets: 'latin' | 'telugu';
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
