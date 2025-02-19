import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Baloo Bhai Two',
	importName: 'BalooBhai2',
	version: 'v28',
	url: 'https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:ital,wght@0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		gujarati:
			'U+0951-0952, U+0964-0965, U+0A80-0AFF, U+200C-200D, U+20B9, U+25CC, U+A830-A839',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				gujarati:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHbd7nuH0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHed7nuH0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHeN7nuH0.woff2',
				latin:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHdt7n.woff2',
			},
			'500': {
				gujarati:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHbd7nuH0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHed7nuH0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHeN7nuH0.woff2',
				latin:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHdt7n.woff2',
			},
			'600': {
				gujarati:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHbd7nuH0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHed7nuH0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHeN7nuH0.woff2',
				latin:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHdt7n.woff2',
			},
			'700': {
				gujarati:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHbd7nuH0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHed7nuH0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHeN7nuH0.woff2',
				latin:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHdt7n.woff2',
			},
			'800': {
				gujarati:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHbd7nuH0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHed7nuH0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHeN7nuH0.woff2',
				latin:
					'https://fonts.gstatic.com/s/baloobhai2/v28/sZlDdRSL-z1VEWZ4YNA7Y5IHdt7n.woff2',
			},
		},
	},
});

export const fontFamily = 'Baloo Bhai Two' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800';
		subsets: 'gujarati' | 'latin' | 'latin-ext' | 'vietnamese';
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
