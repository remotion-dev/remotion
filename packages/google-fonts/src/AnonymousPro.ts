import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Anonymous Pro',
	importName: 'AnonymousPro',
	version: 'v21',
	url: 'https://fonts.googleapis.com/css2?family=Anonymous+Pro:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2fp2a15UIB7Un-bOeISG3pHl4G8wn50Ko.woff2',
				greek:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2fp2a15UIB7Un-bOeISG3pHl4G9An50Ko.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2fp2a15UIB7Un-bOeISG3pHl4G-Qn50Ko.woff2',
				latin:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2fp2a15UIB7Un-bOeISG3pHl4G9wn5.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2ap2a15UIB7Un-bOeISG3pHl4OTCzs64u24Ko.woff2',
				greek:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2ap2a15UIB7Un-bOeISG3pHl4OTCzs7Iu24Ko.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2ap2a15UIB7Un-bOeISG3pHl4OTCzs4Yu24Ko.woff2',
				latin:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2ap2a15UIB7Un-bOeISG3pHl4OTCzs74u2.woff2',
			},
		},
		normal: {
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2Bp2a15UIB7Un-bOeISG3pHl829RH9.woff2',
				greek:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2Bp2a15UIB7Un-bOeISG3pHlg29RH9.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2Bp2a15UIB7Un-bOeISG3pHlU29RH9.woff2',
				latin:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2Bp2a15UIB7Un-bOeISG3pHls29Q.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2cp2a15UIB7Un-bOeISG3pFuAT4Crc7ZOy.woff2',
				greek:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2cp2a15UIB7Un-bOeISG3pFuAT4C3c7ZOy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2cp2a15UIB7Un-bOeISG3pFuAT4CDc7ZOy.woff2',
				latin:
					'https://fonts.gstatic.com/s/anonymouspro/v21/rP2cp2a15UIB7Un-bOeISG3pFuAT4C7c7Q.woff2',
			},
		},
	},
});

export const fontFamily = 'Anonymous Pro' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'greek' | 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '700';
		subsets: 'cyrillic' | 'greek' | 'latin' | 'latin-ext';
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
