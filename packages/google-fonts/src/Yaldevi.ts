import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Yaldevi',
	importName: 'Yaldevi',
	version: 'v16',
	url: 'https://fonts.googleapis.com/css2?family=Yaldevi:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		sinhala:
			'U+0964-0965, U+0D81-0DF4, U+1CF2, U+200C-200D, U+25CC, U+111E1-111F4',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'200': {
				sinhala:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJs3qyuHT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJt7qyuHT.woff2',
				latin:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJtDqyg.woff2',
			},
			'300': {
				sinhala:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJs3qyuHT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJt7qyuHT.woff2',
				latin:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJtDqyg.woff2',
			},
			'400': {
				sinhala:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJs3qyuHT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJt7qyuHT.woff2',
				latin:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJtDqyg.woff2',
			},
			'500': {
				sinhala:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJs3qyuHT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJt7qyuHT.woff2',
				latin:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJtDqyg.woff2',
			},
			'600': {
				sinhala:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJs3qyuHT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJt7qyuHT.woff2',
				latin:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJtDqyg.woff2',
			},
			'700': {
				sinhala:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJs3qyuHT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJt7qyuHT.woff2',
				latin:
					'https://fonts.gstatic.com/s/yaldevi/v16/cY9Ffj6VW0NMrDWtJtDqyg.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'sinhala'],
});

export const fontFamily = 'Yaldevi' as const;

type Variants = {
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'sinhala';
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
