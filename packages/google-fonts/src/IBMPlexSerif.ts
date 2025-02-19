import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'IBM Plex Serif',
	importName: 'IBMPlexSerif',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
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
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizHREVNn1dOx-zrZ2X3pZvkTiUa41YjgX7MsNo.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizHREVNn1dOx-zrZ2X3pZvkTiUa41YjiH7MsNo.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizHREVNn1dOx-zrZ2X3pZvkTiUa41Yjg37MsNo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizHREVNn1dOx-zrZ2X3pZvkTiUa41Yjgn7MsNo.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizHREVNn1dOx-zrZ2X3pZvkTiUa41YjjH7M.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4_oym1TpjeOg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4_oym13pjeOg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4_oym1bpjeOg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4_oym1fpjeOg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4_oym1npjQ.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa454xm1TpjeOg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa454xm13pjeOg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa454xm1bpjeOg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa454xm1fpjeOg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa454xm1npjQ.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTiUa6zgTjmbI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTiUa6zETjmbI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTiUa6zoTjmbI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTiUa6zsTjmbI.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTiUa6zUTjg.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa48Ywm1TpjeOg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa48Ywm13pjeOg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa48Ywm1bpjeOg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa48Ywm1fpjeOg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa48Ywm1npjQ.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4-o3m1TpjeOg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4-o3m13pjeOg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4-o3m1bpjeOg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4-o3m1fpjeOg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4-o3m1npjQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4442m1TpjeOg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4442m13pjeOg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4442m1bpjeOg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4442m1fpjeOg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizGREVNn1dOx-zrZ2X3pZvkTiUa4442m1npjQ.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTi186zgTjmbI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTi186zETjmbI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTi186zoTjmbI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTi186zsTjmbI.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizBREVNn1dOx-zrZ2X3pZvkTi186zUTjg.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3Q-iI5q1vxiQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3Q-iIwq1vxiQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3Q-iI7q1vxiQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3Q-iI6q1vxiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3Q-iI0q1s.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi20-SI5q1vxiQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi20-SIwq1vxiQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi20-SI7q1vxiQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi20-SI6q1vxiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi20-SI0q1s.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizDREVNn1dOx-zrZ2X3pZvkTiUS2zcLig.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizDREVNn1dOx-zrZ2X3pZvkTiUb2zcLig.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizDREVNn1dOx-zrZ2X3pZvkTiUQ2zcLig.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizDREVNn1dOx-zrZ2X3pZvkTiUR2zcLig.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizDREVNn1dOx-zrZ2X3pZvkTiUf2zc.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3s-CI5q1vxiQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3s-CIwq1vxiQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3s-CI7q1vxiQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3s-CI6q1vxiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3s-CI0q1s.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yI5q1vxiQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yIwq1vxiQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yI7q1vxiQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yI6q1vxiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi3A_yI0q1s.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi2k_iI5q1vxiQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi2k_iIwq1vxiQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi2k_iI7q1vxiQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi2k_iI6q1vxiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTi2k_iI0q1s.woff2',
			},
		},
	},
});

export const fontFamily = 'IBM Plex Serif' as const;

type Variants = {
	italic: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
