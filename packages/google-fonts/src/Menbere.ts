import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Menbere',
	importName: 'Menbere',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Menbere:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		ethiopic:
			'U+030E, U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7E6, U+1E7E8-1E7EB, U+1E7ED-1E7EE, U+1E7F0-1E7FE',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				ethiopic:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2V6KrI8L.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UCKrI8L.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UGKrI8L.woff2',
				latin:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2U-KrA.woff2',
			},
			'200': {
				ethiopic:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2V6KrI8L.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UCKrI8L.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UGKrI8L.woff2',
				latin:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2U-KrA.woff2',
			},
			'300': {
				ethiopic:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2V6KrI8L.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UCKrI8L.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UGKrI8L.woff2',
				latin:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2U-KrA.woff2',
			},
			'400': {
				ethiopic:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2V6KrI8L.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UCKrI8L.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UGKrI8L.woff2',
				latin:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2U-KrA.woff2',
			},
			'500': {
				ethiopic:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2V6KrI8L.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UCKrI8L.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UGKrI8L.woff2',
				latin:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2U-KrA.woff2',
			},
			'600': {
				ethiopic:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2V6KrI8L.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UCKrI8L.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UGKrI8L.woff2',
				latin:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2U-KrA.woff2',
			},
			'700': {
				ethiopic:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2V6KrI8L.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UCKrI8L.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2UGKrI8L.woff2',
				latin:
					'https://fonts.gstatic.com/s/menbere/v1/lJwH-p0zhmBrWvcG2U-KrA.woff2',
			},
		},
	},
	subsets: ['ethiopic', 'latin', 'latin-ext', 'vietnamese'],
});

export const fontFamily = 'Menbere' as const;

type Variants = {
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'ethiopic' | 'latin' | 'latin-ext' | 'vietnamese';
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
