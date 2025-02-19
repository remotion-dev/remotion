import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Akatab',
	importName: 'Akatab',
	version: 'v7',
	url: 'https://fonts.googleapis.com/css2?family=Akatab:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		tifinagh:
			'U+02C7, U+0301-0302, U+0304, U+0306-0307, U+0309, U+0323, U+0331, U+200C-200D, U+202E, U+25CC, U+2D30-2D7F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				tifinagh:
					'https://fonts.gstatic.com/s/akatab/v7/VuJwdNrK3Z7gqJE_f4b4BIg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/akatab/v7/VuJwdNrK3Z7gqJE_UYb4BIg.woff2',
				latin:
					'https://fonts.gstatic.com/s/akatab/v7/VuJwdNrK3Z7gqJE_X4b4.woff2',
			},
			'500': {
				tifinagh:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3rKXtG6ljWRo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3rKXtNaljWRo.woff2',
				latin:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3rKXtO6lj.woff2',
			},
			'600': {
				tifinagh:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3gKLtG6ljWRo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3gKLtNaljWRo.woff2',
				latin:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3gKLtO6lj.woff2',
			},
			'700': {
				tifinagh:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE35KPtG6ljWRo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE35KPtNaljWRo.woff2',
				latin:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE35KPtO6lj.woff2',
			},
			'800': {
				tifinagh:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3-KDtG6ljWRo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3-KDtNaljWRo.woff2',
				latin:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE3-KDtO6lj.woff2',
			},
			'900': {
				tifinagh:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE33KHtG6ljWRo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE33KHtNaljWRo.woff2',
				latin:
					'https://fonts.gstatic.com/s/akatab/v7/VuJzdNrK3Z7gqJE33KHtO6lj.woff2',
			},
		},
	},
});

export const fontFamily = 'Akatab' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext' | 'tifinagh';
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
