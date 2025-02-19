import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Sarabun',
	importName: 'Sarabun',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800',
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
			'100': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVnJx26TKEr37c9aBBx_kwfzg3upg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVnJx26TKEr37c9aBBx_kwEzg3upg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVnJx26TKEr37c9aBBx_kwFzg3upg.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVnJx26TKEr37c9aBBx_kwLzg0.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxUl0c_SjTnwE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxUl0c5ijTnwE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxUl0c5yjTnwE.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxUl0c6SjT.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxNl4c_SjTnwE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxNl4c5ijTnwE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxNl4c5yjTnwE.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxNl4c6SjT.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9aBB5iXwJ1gk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9aBB5knwJ1gk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9aBB5k3wJ1gk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9aBB5nXwJ.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxbl8c_SjTnwE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxbl8c5ijTnwE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxbl8c5yjTnwE.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxbl8c6SjT.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxQlgc_SjTnwE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxQlgc5ijTnwE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxQlgc5yjTnwE.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxQlgc6SjT.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxJlkc_SjTnwE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxJlkc5ijTnwE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxJlkc5yjTnwE.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxJlkc6SjT.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxOloc_SjTnwE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxOloc5ijTnwE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxOloc5yjTnwE.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVkJx26TKEr37c9aBBxOloc6SjT.woff2',
			},
		},
		normal: {
			'100': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9YHZ5iXwJ1gk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9YHZ5knwJ1gk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9YHZ5k3wJ1gk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVhJx26TKEr37c9YHZ5nXwJ.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YNpoik8s6zDX.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YNpoilQs6zDX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YNpoilUs6zDX.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YNpoilss6w.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YL5rik8s6zDX.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YL5rilQs6zDX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YL5rilUs6zDX.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YL5rilss6w.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVjJx26TKEr37c9aAFJn2QN.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVjJx26TKEr37c9aBpJn2QN.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVjJx26TKEr37c9aBtJn2QN.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVjJx26TKEr37c9aBVJnw.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YOZqik8s6zDX.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YOZqilQs6zDX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YOZqilUs6zDX.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YOZqilss6w.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YMptik8s6zDX.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YMptilQs6zDX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YMptilUs6zDX.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YMptilss6w.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YK5sik8s6zDX.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YK5silQs6zDX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YK5silUs6zDX.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YK5silss6w.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YLJvik8s6zDX.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YLJvilQs6zDX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YLJvilUs6zDX.woff2',
				latin:
					'https://fonts.gstatic.com/s/sarabun/v15/DtVmJx26TKEr37c9YLJvilss6w.woff2',
			},
		},
	},
});

export const fontFamily = 'Sarabun' as const;

type Variants = {
	italic: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
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
