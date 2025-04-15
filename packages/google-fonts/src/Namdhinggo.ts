import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Namdhinggo',
	importName: 'Namdhinggo',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Namdhinggo:ital,wght@0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		limbu: 'U+0964-0965, U+1900-194F, U+200C-200D, U+25CC',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				limbu:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-mEGe3rbgg8Xzoy5-TPkep4hxx.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-mEGe3rbgg8Xzoy5-TPnyp4hxx.woff2',
				latin:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-mEGe3rbgg8Xzoy5-TPnKp4g.woff2',
			},
			'500': {
				limbu:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNoGK9xZQ87ZK.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNoGK9y1Q87ZK.woff2',
				latin:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNoGK9yNQ8w.woff2',
			},
			'600': {
				limbu:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNq2N9xZQ87ZK.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNq2N9y1Q87ZK.woff2',
				latin:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNq2N9yNQ8w.woff2',
			},
			'700': {
				limbu:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNsmM9xZQ87ZK.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNsmM9y1Q87ZK.woff2',
				latin:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNsmM9yNQ8w.woff2',
			},
			'800': {
				limbu:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNtWP9xZQ87ZK.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNtWP9y1Q87ZK.woff2',
				latin:
					'https://fonts.gstatic.com/s/namdhinggo/v2/uk-lEGe3rbgg8Xzoy5-TNtWP9yNQ8w.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'limbu'],
});

export const fontFamily = 'Namdhinggo' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800';
		subsets: 'latin' | 'latin-ext' | 'limbu';
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
