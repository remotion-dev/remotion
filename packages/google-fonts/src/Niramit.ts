import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Niramit',
	importName: 'Niramit',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Niramit:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		thai: 'U+0E01-0E5B, U+200C-200D, U+25CC',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiXim-uLfFVZ8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiXim-o7fFVZ8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiXim-orfFVZ8.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiXim-rLfF.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiOiq-uLfFVZ8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiOiq-o7fFVZ8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiOiq-orfFVZ8.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiOiq-rLfF.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_usMpWdvgLdNxVLXbZqhQirk5Y.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_usMpWdvgLdNxVLXbZqngirk5Y.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_usMpWdvgLdNxVLXbZqnwirk5Y.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_usMpWdvgLdNxVLXbZqkQir.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiYiu-uLfFVZ8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiYiu-o7fFVZ8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiYiu-orfFVZ8.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiYiu-rLfF.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiTiy-uLfFVZ8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiTiy-o7fFVZ8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiTiy-orfFVZ8.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiTiy-rLfF.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiKi2-uLfFVZ8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiKi2-o7fFVZ8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiKi2-orfFVZ8.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_upMpWdvgLdNxVLXbZiKi2-rLfF.woff2',
			},
		},
		normal: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVXx7hjuOrq_B.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVXx7hiCOrq_B.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVXx7hiGOrq_B.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVXx7hi-Org.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVRh4hjuOrq_B.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVRh4hiCOrq_B.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVRh4hiGOrq_B.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVRh4hi-Org.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_uuMpWdvgLdNxVLXadakxCv.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_uuMpWdvgLdNxVLXbxakxCv.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_uuMpWdvgLdNxVLXb1akxCv.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_uuMpWdvgLdNxVLXbNakw.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVUB5hjuOrq_B.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVUB5hiCOrq_B.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVUB5hiGOrq_B.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVUB5hi-Org.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVWx-hjuOrq_B.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVWx-hiCOrq_B.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVWx-hiGOrq_B.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVWx-hi-Org.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVQh_hjuOrq_B.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVQh_hiCOrq_B.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVQh_hiGOrq_B.woff2',
				latin:
					'https://fonts.gstatic.com/s/niramit/v10/I_urMpWdvgLdNxVLVQh_hi-Org.woff2',
			},
		},
	},
});

export const fontFamily = 'Niramit' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
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
