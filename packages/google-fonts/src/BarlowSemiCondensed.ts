import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Barlow Semi Condensed',
	importName: 'BarlowSemiCondensed',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
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
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpjgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbLLEEMAhqSP.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpjgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbLLEEIAhqSP.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpjgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbLLEEwAhg.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJnAVsoo5m2fA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJnAVspo5m2fA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJnAVsno5k.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIDAlsoo5m2fA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIDAlspo5m2fA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIDAlsno5k.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlphgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbqnIE4Ygg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlphgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbqmIE4Ygg.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlphgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbqoIE4.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJbA1soo5m2fA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJbA1spo5m2fA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJbA1sno5k.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJ3BFsoo5m2fA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJ3BFspo5m2fA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbJ3BFsno5k.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbITBVsoo5m2fA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbITBVspo5m2fA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbITBVsno5k.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIPBlsoo5m2fA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIPBlspo5m2fA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIPBlsno5k.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIrB1soo5m2fA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIrB1spo5m2fA.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpkgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXfbIrB1sno5k.woff2',
			},
		},
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlphgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfG7qnIE4Ygg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlphgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfG7qmIE4Ygg.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlphgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfG7qoIE4.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRft6u_CGslu50.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRft6u_CWslu50.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRft6u_B2sl.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf06i_CGslu50.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf06i_CWslu50.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf06i_B2sl.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpvgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXd4qqOEo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpvgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXdoqqOEo.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpvgxjLBV1hqnzfr-F8sEYMB0Yybp0mudRXeIqq.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfi6m_CGslu50.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfi6m_CWslu50.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfi6m_B2sl.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfp66_CGslu50.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfp66_CWslu50.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfp66_B2sl.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfw6-_CGslu50.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfw6-_CWslu50.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfw6-_B2sl.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf36y_CGslu50.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf36y_CWslu50.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf36y_B2sl.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf-62_CGslu50.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf-62_CWslu50.woff2',
				latin:
					'https://fonts.gstatic.com/s/barlowsemicondensed/v15/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRf-62_B2sl.woff2',
			},
		},
	},
});

export const fontFamily = 'Barlow Semi Condensed' as const;

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
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
