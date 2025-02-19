import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'IBM Plex Sans Condensed',
	importName: 'IBMPlexSansCondensed',
	version: 'v14',
	url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700',
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
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8hN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8M_7j6MILhM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8hN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8M_7jaMILhM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8hN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8M_7jKMILhM.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8hN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8M_7gqMI.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8GPqlYktEyq5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8GPqlYstEyq5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8GPqlYotEyq5.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8GPqlYQtEw.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8AfplYktEyq5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8AfplYstEyq5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8AfplYotEyq5.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8AfplYQtEw.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas-KHLgLsM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas-KPLgLsM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas-KLLgLsM.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas-KzLgA.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8F_olYktEyq5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8F_olYstEyq5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8F_olYotEyq5.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8F_olYQtEw.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8HPvlYktEyq5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8HPvlYstEyq5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8HPvlYotEyq5.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8HPvlYQtEw.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8BfulYktEyq5.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8BfulYstEyq5.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8BfulYotEyq5.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8iN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYas8BfulYQtEw.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY7K-KHLgLsM.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY7K-KPLgLsM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY7K-KLLgLsM.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8nN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY7K-KzLgA.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5m6bvhpYY1Fw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5m6bvjpYY1Fw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5m6bvipYY1Fw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5m6bvspYY.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4C6rvhpYY1Fw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4C6rvjpYY1Fw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4C6rvipYY1Fw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4C6rvspYY.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8lN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYakyK7ThA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8lN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYamyK7ThA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8lN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYanyK7ThA.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8lN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHYapyK4.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5a67vhpYY1Fw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5a67vjpYY1Fw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5a67vipYY1Fw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY5a67vspYY.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY527LvhpYY1Fw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY527LvjpYY1Fw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY527LvipYY1Fw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY527LvspYY.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4S7bvhpYY1Fw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4S7bvjpYY1Fw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4S7bvipYY1Fw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanscondensed/v14/Gg8gN4UfRSqiPg7Jn2ZI12V4DCEwkj1E4LVeHY4S7bvspYY.woff2',
			},
		},
	},
});

export const fontFamily = 'IBM Plex Sans Condensed' as const;

type Variants = {
	italic: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
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
