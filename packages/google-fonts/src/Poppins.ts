import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Poppins',
	importName: 'Poppins',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiAyp8kv8JHgFVrJJLmE0tMMPKzSQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiAyp8kv8JHgFVrJJLmE0tCMPI.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmv1pVGdeOcEg.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmv1pVF9eO.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLm21lVGdeOcEg.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLm21lVF9eO.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiGyp8kv8JHgFVrJJLufntAKPY.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiGyp8kv8JHgFVrJJLucHtA.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmg1hVGdeOcEg.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmg1hVF9eO.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmr19VGdeOcEg.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmr19VF9eO.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmy15VGdeOcEg.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmy15VF9eO.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLm111VGdeOcEg.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLm111VF9eO.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLm81xVGdeOcEg.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLm81xVF9eO.woff2',
			},
		},
		normal: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiGyp8kv8JHgFVrLPTufntAKPY.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiGyp8kv8JHgFVrLPTucHtA.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLFj_Z1JlFc-K.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLFj_Z1xlFQ.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDz8Z1JlFc-K.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDz8Z1xlFQ.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJnecmNE.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1JlFc-K.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1JlFc-K.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1JlFc-K.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1JlFc-K.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1xlFQ.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLBT5Z1JlFc-K.woff2',
				latin:
					'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLBT5Z1xlFQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Poppins' as const;

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
		subsets: 'devanagari' | 'latin' | 'latin-ext';
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
		subsets: 'devanagari' | 'latin' | 'latin-ext';
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
