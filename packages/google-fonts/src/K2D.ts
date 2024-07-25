import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'KTwoD',
	importName: 'K2D',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=K2D:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800',
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
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7afnpF2V0EjdZ1NhKUY66NL.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7afnpF2V0EjdZ1NhL4Y66NL.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7afnpF2V0EjdZ1NhL8Y66NL.woff2',
				latin:
					'https://fonts.gstatic.com/s/k2d/v11/J7afnpF2V0EjdZ1NhLEY6w.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3hlaYrzp5yGw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3hlaYwzp5yGw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3hlaYxzp5yGw.woff2',
				latin:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3hlaY_zp4.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2FlqYrzp5yGw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2FlqYwzp5yGw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2FlqYxzp5yGw.woff2',
				latin:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2FlqY_zp4.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0EjdZU6tLMA7w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0EjdZUhtLMA7w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0EjdZUgtLMA7w.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0EjdZUutLM.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3dl6Yrzp5yGw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3dl6Ywzp5yGw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3dl6Yxzp5yGw.woff2',
				latin:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3dl6Y_zp4.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3xkKYrzp5yGw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3xkKYwzp5yGw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3xkKYxzp5yGw.woff2',
				latin:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ3xkKY_zp4.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2VkaYrzp5yGw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2VkaYwzp5yGw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2VkaYxzp5yGw.woff2',
				latin:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2VkaY_zp4.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2JkqYrzp5yGw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2JkqYwzp5yGw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2JkqYxzp5yGw.woff2',
				latin:
					'https://fonts.gstatic.com/s/k2d/v11/J7acnpF2V0EjdZ2JkqY_zp4.woff2',
			},
		},
		normal: {
			'100': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0ErE5U6tLMA7w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0ErE5UhtLMA7w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0ErE5UgtLMA7w.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aRnpF2V0ErE5UutLM.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erv4Q5h5Y91po.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erv4Q5nJY91po.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erv4Q5nZY91po.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erv4Q5k5Y9.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er24c5h5Y91po.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er24c5nJY91po.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er24c5nZY91po.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er24c5k5Y9.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aTnpF2V0EjZKUsrLc.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aTnpF2V0Ejf6UsrLc.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aTnpF2V0EjfqUsrLc.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aTnpF2V0EjcKUs.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erg4Y5h5Y91po.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erg4Y5nJY91po.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erg4Y5nZY91po.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Erg4Y5k5Y9.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Err4E5h5Y91po.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Err4E5nJY91po.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Err4E5nZY91po.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Err4E5k5Y9.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Ery4A5h5Y91po.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Ery4A5nJY91po.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Ery4A5nZY91po.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Ery4A5k5Y9.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er14M5h5Y91po.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er14M5nJY91po.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er14M5nZY91po.woff2',
				latin: 'https://fonts.gstatic.com/s/k2d/v11/J7aenpF2V0Er14M5k5Y9.woff2',
			},
		},
	},
});

export const fontFamily = 'KTwoD' as const;

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
