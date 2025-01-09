import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Ubuntu',
	importName: 'Ubuntu',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZftVyCN4Ffgg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZftVyLN4Ffgg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZftVyDN4Ffgg.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZftVyMN4Ffgg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZftVyBN4Ffgg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZftVyPN4E.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCu6KVjbNBYlgoKej75l0mwFg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCu6KVjbNBYlgoKej7wl0mwFg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCu6KVjbNBYlgoKej74l0mwFg.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCu6KVjbNBYlgoKej73l0mwFg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCu6KVjbNBYlgoKej76l0mwFg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCu6KVjbNBYlgoKej70l0k.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejYHtFyCN4Ffgg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejYHtFyLN4Ffgg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejYHtFyDN4Ffgg.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejYHtFyMN4Ffgg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejYHtFyBN4Ffgg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejYHtFyPN4E.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZPslyCN4Ffgg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZPslyLN4Ffgg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZPslyDN4Ffgg.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZPslyMN4Ffgg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZPslyBN4Ffgg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCp6KVjbNBYlgoKejZPslyPN4E.woff2',
			},
		},
		normal: {
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoC1CzjvWyNL4U.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoC1CzjtGyNL4U.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoC1CzjvGyNL4U.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoC1Czjs2yNL4U.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoC1CzjvmyNL4U.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoC1CzjsGyN.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgoKcg72j00.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgoKew72j00.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgoKcw72j00.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgoKfA72j00.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgoKcQ72j00.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgoKfw72.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCjC3jvWyNL4U.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCjC3jtGyNL4U.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCjC3jvGyNL4U.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCjC3js2yNL4U.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCjC3jvmyNL4U.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCjC3jsGyN.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCxCvjvWyNL4U.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCxCvjtGyNL4U.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCxCvjvGyNL4U.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCxCvjs2yNL4U.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCxCvjvmyNL4U.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCxCvjsGyN.woff2',
			},
		},
	},
});

export const fontFamily = 'Ubuntu' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext';
	};
	normal: {
		weights: '300' | '400' | '500' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext';
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
