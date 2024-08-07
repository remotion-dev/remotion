import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Merriweather Sans',
	importName: 'MerriweatherSans',
	version: 'v26',
	url: 'https://fonts.googleapis.com/css2?family=Merriweather+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjrj9ytf.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjjj9ytf.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjnj9ytf.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjfj9w.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjrj9ytf.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjjj9ytf.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjnj9ytf.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjfj9w.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjrj9ytf.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjjj9ytf.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjnj9ytf.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjfj9w.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjrj9ytf.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjjj9ytf.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjnj9ytf.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjfj9w.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjrj9ytf.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjjj9ytf.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjnj9ytf.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjfj9w.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjrj9ytf.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjjj9ytf.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjnj9ytf.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c79IRs1JiJN1FRAMjTN5zd9vgsFHXwcjfj9w.woff2',
			},
		},
		normal: {
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX4QjX78w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX6QjX78w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX7QjX78w.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX4QjX78w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX6QjX78w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX7QjX78w.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX4QjX78w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX6QjX78w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX7QjX78w.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX4QjX78w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX6QjX78w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX7QjX78w.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX4QjX78w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX6QjX78w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX7QjX78w.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX4QjX78w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX6QjX78w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX7QjX78w.woff2',
				latin:
					'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.woff2',
			},
		},
	},
});

export const fontFamily = 'Merriweather Sans' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
