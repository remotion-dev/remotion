import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Kawi',
	importName: 'NotoSansKawi',
	version: 'v3',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kawi:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		kawi: 'U+11F00-11F10, U+11F12-11F3A, U+11F3E-11F59',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				kawi: 'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3zNZwVDLIw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xiRiB-FQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xsRiA.woff2',
			},
			'500': {
				kawi: 'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3zNZwVDLIw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xiRiB-FQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xsRiA.woff2',
			},
			'600': {
				kawi: 'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3zNZwVDLIw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xiRiB-FQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xsRiA.woff2',
			},
			'700': {
				kawi: 'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3zNZwVDLIw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xiRiB-FQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanskawi/v3/92zMtBJLNqsg7tCciW0EPHNNh3xsRiA.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Kawi' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'kawi' | 'latin' | 'latin-ext';
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
