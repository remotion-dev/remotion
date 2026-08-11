import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Nushu',
	importName: 'NotoSansNushu',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Nushu:ital,wght@0,400',
	unicodeRanges: {
		nushu: 'U+2003, U+3000, U+3002, U+4E00, U+FE12, U+16FE1, U+1B170-1B2FB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				nushu:
					'https://fonts.gstatic.com/s/notosansnushu/v20/rnCw-xRQ3B7652emAbAe_Ai1IYa1IFoNMrY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansnushu/v20/rnCw-xRQ3B7652emAbAe_Ai1IYa1UVoNMrY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansnushu/v20/rnCw-xRQ3B7652emAbAe_Ai1IYa1X1oN.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'nushu'],
});

export const fontFamily = 'Noto Sans Nushu' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'nushu';
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
