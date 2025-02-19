import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif Toto',
	importName: 'NotoSerifToto',
	version: 'v4',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Toto:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		toto: 'U+1E290-1E2AE',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				toto: 'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHsoK9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHHqOYZY8.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHEKOY.woff2',
			},
			'500': {
				toto: 'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHsoK9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHHqOYZY8.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHEKOY.woff2',
			},
			'600': {
				toto: 'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHsoK9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHHqOYZY8.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHEKOY.woff2',
			},
			'700': {
				toto: 'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHsoK9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHHqOYZY8.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftoto/v4/Ktk1ALSMeZjqPnXk1rCkHYHNtwvHEKOY.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Serif Toto' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'toto';
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
