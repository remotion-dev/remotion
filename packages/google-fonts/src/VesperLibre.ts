import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Vesper Libre',
	importName: 'VesperLibre',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Vesper+Libre:ital,wght@0,400;0,500;0,700;0,900',
	unicodeRanges: {
		devanagari:
			'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				devanagari:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6CNxyWnf-uxPdXDHUD_RdICUWM6qI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6CNxyWnf-uxPdXDHUD_RdIBkWM6qI.woff2',
				latin:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6CNxyWnf-uxPdXDHUD_RdICEWM.woff2',
			},
			'500': {
				devanagari:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdA-2aZ1IMLbKs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdA-2aZ24MLbKs.woff2',
				latin:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdA-2aZ1YML.woff2',
			},
			'700': {
				devanagari:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdAs2CZ1IMLbKs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdAs2CZ24MLbKs.woff2',
				latin:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdAs2CZ1YML.woff2',
			},
			'900': {
				devanagari:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdAi2KZ1IMLbKs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdAi2KZ24MLbKs.woff2',
				latin:
					'https://fonts.gstatic.com/s/vesperlibre/v19/bx6dNxyWnf-uxPdXDHUD_RdAi2KZ1YML.woff2',
			},
		},
	},
});

export const fontFamily = 'Vesper Libre' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '700' | '900';
		subsets: 'devanagari' | 'latin' | 'latin-ext';
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
