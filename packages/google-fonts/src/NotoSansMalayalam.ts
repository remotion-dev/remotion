import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Malayalam',
	importName: 'NotoSansMalayalam',
	version: 'v26',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		malayalam:
			'U+0307, U+0323, U+0951-0952, U+0964-0965, U+0D00-0D7F, U+1CDA, U+1CF2, U+200C-200D, U+20B9, U+25CC, U+A830-A832',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'200': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'300': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'400': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'500': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'600': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'700': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'800': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
			'900': {
				malayalam:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWE6zDy5A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWS6zDy5A.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansmalayalam/v26/sJov3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNOWc6zA.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Malayalam' as const;

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
		subsets: 'latin' | 'latin-ext' | 'malayalam';
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
