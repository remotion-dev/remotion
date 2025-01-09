import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif NP Hmong',
	importName: 'NotoSerifNPHmong',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+NP+Hmong:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'nyiakeng-puachue-hmong': 'U+1E100-1E14F',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'nyiakeng-puachue-hmong':
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3gezKH3yhQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3pCSDQ.woff2',
			},
			'500': {
				'nyiakeng-puachue-hmong':
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3gezKH3yhQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3pCSDQ.woff2',
			},
			'600': {
				'nyiakeng-puachue-hmong':
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3gezKH3yhQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3pCSDQ.woff2',
			},
			'700': {
				'nyiakeng-puachue-hmong':
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3gezKH3yhQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifnphmong/v1/pON61gItFMO79E4L1GPUi-2sixKHZyFj3pCSDQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Serif NP Hmong' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'latin' | 'nyiakeng-puachue-hmong';
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
