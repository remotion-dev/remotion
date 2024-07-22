import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Osage',
	importName: 'NotoSansOsage',
	version: 'v18',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Osage:ital,wght@0,400',
	unicodeRanges: {
		osage: 'U+0301, U+0304, U+030B, U+0358, U+25CC, U+104B0-104FF',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				osage:
					'https://fonts.gstatic.com/s/notosansosage/v18/oPWX_kB6kP4jCuhpgEGmw4mtAVtnyn22y3PV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansosage/v18/oPWX_kB6kP4jCuhpgEGmw4mtAVtnT1yT9ko.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansosage/v18/oPWX_kB6kP4jCuhpgEGmw4mtAVtnQVyT.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Osage' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'latin-ext' | 'osage';
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
