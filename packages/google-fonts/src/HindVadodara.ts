import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Hind Vadodara',
	importName: 'HindVadodara',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Hind+Vadodara:ital,wght@0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		gujarati:
			'U+0951-0952, U+0964-0965, U+0A80-0AFF, U+200C-200D, U+20B9, U+25CC, U+A830-A839',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				gujarati:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSDn3uW8-oBOL.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSDn3uXo-oBOL.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSDn3uXQ-oA.woff2',
			},
			'400': {
				gujarati:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neINzCKvrIcn5pbuuuriV9tTQInVrEsf.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindvadodara/v13/neINzCKvrIcn5pbuuuriV9tTQJzVrEsf.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neINzCKvrIcn5pbuuuriV9tTQJLVrA.woff2',
			},
			'500': {
				gujarati:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSGH2uW8-oBOL.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSGH2uXo-oBOL.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSGH2uXQ-oA.woff2',
			},
			'600': {
				gujarati:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSE3xuW8-oBOL.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSE3xuXo-oBOL.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSE3xuXQ-oA.woff2',
			},
			'700': {
				gujarati:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSCnwuW8-oBOL.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSCnwuXo-oBOL.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindvadodara/v13/neIQzCKvrIcn5pbuuuriV9tTSCnwuXQ-oA.woff2',
			},
		},
	},
});

export const fontFamily = 'Hind Vadodara' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'gujarati' | 'latin' | 'latin-ext';
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
