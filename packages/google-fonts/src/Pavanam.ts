import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Pavanam',
	importName: 'Pavanam',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Pavanam:ital,wght@0,400',
	unicodeRanges: {
		tamil: 'U+0964-0965, U+0B82-0BFA, U+200C-200D, U+20B9, U+25CC',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				tamil:
					'https://fonts.gstatic.com/s/pavanam/v13/BXRrvF_aiezLh0xPPPpa9Ff0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/pavanam/v13/BXRrvF_aiezLh0xPPOJa9Ff0.woff2',
				latin:
					'https://fonts.gstatic.com/s/pavanam/v13/BXRrvF_aiezLh0xPPOxa9A.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'tamil'],
});

export const fontFamily = 'Pavanam' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'tamil';
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
