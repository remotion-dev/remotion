import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Josefin Slab',
	importName: 'JosefinSlab',
	version: 'v26',
	url: 'https://fonts.googleapis.com/css2?family=Josefin+Slab:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-nwjwOK3Ps5GSJlNNkMalnrz6tDs8.woff2',
			},
			'200': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-nwjwOK3Ps5GSJlNNkMalnrz6tDs8.woff2',
			},
			'300': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-nwjwOK3Ps5GSJlNNkMalnrz6tDs8.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-nwjwOK3Ps5GSJlNNkMalnrz6tDs8.woff2',
			},
			'500': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-nwjwOK3Ps5GSJlNNkMalnrz6tDs8.woff2',
			},
			'600': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-nwjwOK3Ps5GSJlNNkMalnrz6tDs8.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-nwjwOK3Ps5GSJlNNkMalnrz6tDs8.woff2',
			},
		},
		normal: {
			'100': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-5wjwOK3Ps5GSJlNNkMalnqg6v.woff2',
			},
			'200': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-5wjwOK3Ps5GSJlNNkMalnqg6v.woff2',
			},
			'300': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-5wjwOK3Ps5GSJlNNkMalnqg6v.woff2',
			},
			'400': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-5wjwOK3Ps5GSJlNNkMalnqg6v.woff2',
			},
			'500': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-5wjwOK3Ps5GSJlNNkMalnqg6v.woff2',
			},
			'600': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-5wjwOK3Ps5GSJlNNkMalnqg6v.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/josefinslab/v26/lW-5wjwOK3Ps5GSJlNNkMalnqg6v.woff2',
			},
		},
	},
});

export const fontFamily = 'Josefin Slab' as const;

type Variants = {
	italic: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin';
	};
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin';
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
