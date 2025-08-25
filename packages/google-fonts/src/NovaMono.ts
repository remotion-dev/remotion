import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Nova Mono',
	importName: 'NovaMono',
	version: 'v22',
	url: 'https://fonts.googleapis.com/css2?family=Nova+Mono:ital,wght@0,400',
	unicodeRanges: {
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				greek:
					'https://fonts.gstatic.com/s/novamono/v22/Cn-0JtiGWQ5Ajb--MRKvZGZZndM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/novamono/v22/Cn-0JtiGWQ5Ajb--MRKvaWZZndM.woff2',
				latin:
					'https://fonts.gstatic.com/s/novamono/v22/Cn-0JtiGWQ5Ajb--MRKvZ2ZZ.woff2',
			},
		},
	},
	subsets: ['greek', 'latin', 'latin-ext'],
});

export const fontFamily = 'Nova Mono' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'greek' | 'latin' | 'latin-ext';
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
