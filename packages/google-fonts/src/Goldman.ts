import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Goldman',
	importName: 'Goldman',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Goldman:ital,wght@0,400;0,700',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/goldman/v20/pe0uMIWbN4JFplR2HDpyB--7.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/goldman/v20/pe0uMIWbN4JFplR2HDtyB--7.woff2',
				latin:
					'https://fonts.gstatic.com/s/goldman/v20/pe0uMIWbN4JFplR2HDVyBw.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/goldman/v20/pe0rMIWbN4JFplR2FI5XEt-aBuZr.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/goldman/v20/pe0rMIWbN4JFplR2FI5XEt6aBuZr.woff2',
				latin:
					'https://fonts.gstatic.com/s/goldman/v20/pe0rMIWbN4JFplR2FI5XEtCaBg.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'vietnamese'],
});

export const fontFamily = 'Goldman' as const;

type Variants = {
	normal: {
		weights: '400' | '700';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
