import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kanit',
	importName: 'Kanit',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		thai: 'U+0E01-0E5B, U+200C-200D, U+25CC',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKV-Go6G5tXcraQI2GwZoREDFs.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKV-Go6G5tXcraQI2GwfYREDFs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKV-Go6G5tXcraQI2GwfIREDFs.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKV-Go6G5tXcraQI2GwcoRE.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI82hZbdhMWJy.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI82hZaxhMWJy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI82hZa1hMWJy.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI82hZaNhMQ.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6miZbdhMWJy.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6miZaxhMWJy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6miZa1hMWJy.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6miZaNhMQ.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcraQKxaAcJxA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcraQKw2AcJxA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcraQKwyAcJxA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcraQKwKAcA.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI_GjZbdhMWJy.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI_GjZaxhMWJy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI_GjZa1hMWJy.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI_GjZaNhMQ.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI92kZbdhMWJy.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI92kZaxhMWJy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI92kZa1hMWJy.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI92kZaNhMQ.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI7mlZbdhMWJy.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI7mlZaxhMWJy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI7mlZa1hMWJy.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI7mlZaNhMQ.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6WmZbdhMWJy.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6WmZaxhMWJy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6WmZa1hMWJy.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI6WmZaNhMQ.woff2',
			},
			'900': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI4GnZbdhMWJy.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI4GnZaxhMWJy.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI4GnZa1hMWJy.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKS-Go6G5tXcraQI4GnZaNhMQ.woff2',
			},
		},
		normal: {
			'100': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcr72KxaAcJxA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcr72Kw2AcJxA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcr72KwyAcJxA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go6G5tXcr72KwKAcA.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5aOhWzVaF5NQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5aOhWoVaF5NQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5aOhWpVaF5NQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5aOhWnVaE.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4-ORWzVaF5NQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4-ORWoVaF5NQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4-ORWpVaF5NQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4-ORWnVaE.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKZ-Go6G5tXcraBGwCYdA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKZ-Go6G5tXcraaGwCYdA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKZ-Go6G5tXcrabGwCYdA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKZ-Go6G5tXcraVGwA.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5mOBWzVaF5NQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5mOBWoVaF5NQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5mOBWpVaF5NQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5mOBWnVaE.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5KPxWzVaF5NQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5KPxWoVaF5NQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5KPxWpVaF5NQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr5KPxWnVaE.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4uPhWzVaF5NQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4uPhWoVaF5NQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4uPhWpVaF5NQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4uPhWnVaE.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4yPRWzVaF5NQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4yPRWoVaF5NQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4yPRWpVaF5NQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4yPRWnVaE.woff2',
			},
			'900': {
				thai: 'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4WPBWzVaF5NQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4WPBWoVaF5NQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4WPBWpVaF5NQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanit/v15/nKKU-Go6G5tXcr4WPBWnVaE.woff2',
			},
		},
	},
});

export const fontFamily = 'Kanit' as const;

type Variants = {
	italic: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
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
