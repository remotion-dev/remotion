import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Bamum',
	importName: 'NotoSansBamum',
	version: 'v27',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bamum:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		bamum: 'U+A6A0-A6FF, U+16800-16A38',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				bamum:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O1I0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg_65O1I0.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg8a5O.woff2',
			},
			'500': {
				bamum:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O1I0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg_65O1I0.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg8a5O.woff2',
			},
			'600': {
				bamum:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O1I0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg_65O1I0.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg8a5O.woff2',
			},
			'700': {
				bamum:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O1I0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg_65O1I0.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbamum/v27/uk-7EGK3o6EruUbnwovcbBTkkklg8a5O.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Bamum' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'bamum' | 'latin' | 'latin-ext';
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
