import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Lobster Two',
	importName: 'LobsterTwo',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/lobstertwo/v20/BngOUXZGTXPUvIoyV6yN5-fI1qeh5A.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/lobstertwo/v20/BngTUXZGTXPUvIoyV6yN5-fI3hyE8R-ifg.woff2',
			},
		},
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/lobstertwo/v20/BngMUXZGTXPUvIoyV6yN5-fN5qU.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/lobstertwo/v20/BngRUXZGTXPUvIoyV6yN5-92w7CGwR0.woff2',
			},
		},
	},
});

export const fontFamily = 'Lobster Two' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets: 'latin';
	};
	normal: {
		weights: '400' | '700';
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
