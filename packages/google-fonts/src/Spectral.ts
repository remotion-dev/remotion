import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Spectral',
	importName: 'Spectral',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800',
	unicodeRanges: {
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qrXHWfCFXUIJ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qrXHWfuFXUIJ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qrXHWfqFXUIJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qrXHWfSFXQ.woff2',
			},
			'300': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qtHEWfCFXUIJ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qtHEWfuFXUIJ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qtHEWfqFXUIJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qtHEWfSFXQ.woff2',
			},
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCt-xNNww_2s0amA9M8on7mTMuk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCt-xNNww_2s0amA9M8onXmTMuk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCt-xNNww_2s0amA9M8onTmTMuk.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCt-xNNww_2s0amA9M8onrmTA.woff2',
			},
			'500': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qonFWfCFXUIJ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qonFWfuFXUIJ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qonFWfqFXUIJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qonFWfSFXQ.woff2',
			},
			'600': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qqXCWfCFXUIJ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qqXCWfuFXUIJ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qqXCWfqFXUIJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qqXCWfSFXQ.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qsHDWfCFXUIJ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qsHDWfuFXUIJ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qsHDWfqFXUIJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qsHDWfSFXQ.woff2',
			},
			'800': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qt3AWfCFXUIJ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qt3AWfuFXUIJ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qt3AWfqFXUIJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA9M8qt3AWfSFXQ.woff2',
			},
		},
		normal: {
			'200': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9v2s23FafadWQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9v2s23OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9v2s23PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9v2s23BafY.woff2',
			},
			'300': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uSsG3FafadWQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uSsG3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uSsG3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uSsG3BafY.woff2',
			},
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCr-xNNww_2s0amA9M9knj-SA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCr-xNNww_2s0amA9M2knj-SA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCr-xNNww_2s0amA9M3knj-SA.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCr-xNNww_2s0amA9M5kng.woff2',
			},
			'500': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vKsW3FafadWQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vKsW3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vKsW3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vKsW3BafY.woff2',
			},
			'600': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vmtm3FafadWQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vmtm3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vmtm3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9vmtm3BafY.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uCt23FafadWQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uCt23OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uCt23PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uCt23BafY.woff2',
			},
			'800': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uetG3FafadWQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uetG3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uetG3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9uetG3BafY.woff2',
			},
		},
	},
});

export const fontFamily = 'Spectral' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
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
