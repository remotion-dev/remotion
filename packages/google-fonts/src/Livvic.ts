import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Livvic',
	importName: 'Livvic',
	version: 'v14',
	url: 'https://fonts.googleapis.com/css2?family=Livvic:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,900',
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
					'https://fonts.gstatic.com/s/livvic/v14/rnCt-x1S2hzjrlfXbdtaonXmTMuk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCt-x1S2hzjrlfXbdtaonTmTMuk.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCt-x1S2hzjrlfXbdtaonrmTA.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdv2s23OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdv2s23PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdv2s23BafY.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbduSsG3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbduSsG3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbduSsG3BafY.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCr-x1S2hzjrlfXbdM2knj-SA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCr-x1S2hzjrlfXbdM3knj-SA.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCr-x1S2hzjrlfXbdM5kng.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdvKsW3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdvKsW3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdvKsW3BafY.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdvmtm3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdvmtm3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdvmtm3BafY.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbduCt23OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbduCt23PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbduCt23BafY.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdu6tW3OafadWQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdu6tW3PafadWQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCs-x1S2hzjrlfXbdu6tW3BafY.woff2',
			},
		},
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCr-x1S2hzjrlffC9M2knj-SA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCr-x1S2hzjrlffC9M3knj-SA.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCr-x1S2hzjrlffC9M5kng.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffp8Iuul3DcfI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffp8Iuu13DcfI.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffp8IutV3D.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffw8Euul3DcfI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffw8Euu13DcfI.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffw8EutV3D.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCp-x1S2hzjrlfXZ-M7inw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCp-x1S2hzjrlfXZuM7inw.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCp-x1S2hzjrlfXaOM7.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffm8Auul3DcfI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffm8Auu13DcfI.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlffm8AutV3D.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlfft8cuul3DcfI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlfft8cuu13DcfI.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlfft8cutV3D.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlff08Yuul3DcfI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlff08Yuu13DcfI.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlff08YutV3D.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlff68Quul3DcfI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlff68Quu13DcfI.woff2',
				latin:
					'https://fonts.gstatic.com/s/livvic/v14/rnCq-x1S2hzjrlff68QutV3D.woff2',
			},
		},
	},
});

export const fontFamily = 'Livvic' as const;

type Variants = {
	italic: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '900';
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '900';
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
