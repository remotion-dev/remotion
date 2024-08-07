import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Telugu',
	importName: 'NotoSansTelugu',
	version: 'v26',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		telugu:
			'U+0951-0952, U+0964-0965, U+0C00-0C7F, U+1CDA, U+1CF2, U+200C-200D, U+25CC',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'200': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'300': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'400': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'500': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'600': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'700': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'800': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
			'900': {
				telugu:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARN5IjvvA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARf5IjvvA.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstelugu/v26/0FlCVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVARR5Ig.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Telugu' as const;

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
		subsets: 'latin' | 'latin-ext' | 'telugu';
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
