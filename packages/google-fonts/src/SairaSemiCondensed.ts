import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Saira Semi Condensed',
	importName: 'SairaSemiCondensed',
	version: 'v13',
	url: 'https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MN6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXdvWOs2rET-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MN6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXdvWOo2rET-.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MN6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXdvWOQ2rA.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXfDSfMeiXnH6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXfDSfMfiXnH6A.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXfDSfMRiXk.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXenSvMeiXnH6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXenSvMfiXnH6A.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXenSvMRiXk.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MD6c-2-nnJkHxyCjRcnMHcWVWV1cWRRX8DaOYuqA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MD6c-2-nnJkHxyCjRcnMHcWVWV1cWRRX8CaOYuqA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MD6c-2-nnJkHxyCjRcnMHcWVWV1cWRRX8MaOY.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXf_S_MeiXnH6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXf_S_MfiXnH6A.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXf_S_MRiXk.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXfTTPMeiXnH6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXfTTPMfiXnH6A.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXfTTPMRiXk.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXe3TfMeiXnH6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXe3TfMfiXnH6A.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXe3TfMRiXk.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXerTvMeiXnH6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXerTvMfiXnH6A.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXerTvMRiXk.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXePT_MeiXnH6A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXePT_MfiXnH6A.woff2',
				latin:
					'https://fonts.gstatic.com/s/sairasemicondensed/v13/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXePT_MRiXk.woff2',
			},
		},
	},
});

export const fontFamily = 'Saira Semi Condensed' as const;

type Variants = {
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
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
