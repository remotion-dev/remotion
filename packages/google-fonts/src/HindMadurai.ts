import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Hind Madurai',
	importName: 'HindMadurai',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Hind+Madurai:ital,wght@0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		tamil: 'U+0964-0965, U+0B82-0BFA, U+200C-200D, U+20B9, U+25CC',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				tamil:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfXaUXaMEpAJ0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfXaUXcMEpAJ0.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfXaUXfsEp.woff2',
			},
			'400': {
				tamil:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xx0e2p98ZvDXdZQIOcpqjX4IcCQeA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xx0e2p98ZvDXdZQIOcpqjX-IcCQeA.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xx0e2p98ZvDXdZQIOcpqjX9ocC.woff2',
			},
			'500': {
				tamil:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfBaQXaMEpAJ0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfBaQXcMEpAJ0.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfBaQXfsEp.woff2',
			},
			'600': {
				tamil:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfKaMXaMEpAJ0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfKaMXcMEpAJ0.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfKaMXfsEp.woff2',
			},
			'700': {
				tamil:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfTaIXaMEpAJ0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfTaIXcMEpAJ0.woff2',
				latin:
					'https://fonts.gstatic.com/s/hindmadurai/v11/f0Xu0e2p98ZvDXdZQIOcpqjfTaIXfsEp.woff2',
			},
		},
	},
});

export const fontFamily = 'Hind Madurai' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'tamil';
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
