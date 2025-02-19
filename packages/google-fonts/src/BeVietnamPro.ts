import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Be Vietnam Pro',
	importName: 'BeVietnamPro',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
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
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVLSTAyLFyeg_IDWvOJmVES_HwyPRsibZgmSh8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVLSTAyLFyeg_IDWvOJmVES_HwyPRsibJgmSh8.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVLSTAyLFyeg_IDWvOJmVES_HwyPRsiYpgm.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPbczdbADdyap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPbczdbEDdyap.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPbczdb8Ddw.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPdMwdbADdyap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPdMwdbEDdyap.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPdMwdb8Ddw.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVNSTAyLFyeg_IDWvOJmVES_HwyNXcSYIAi.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVNSTAyLFyeg_IDWvOJmVES_HwyNXYSYIAi.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVNSTAyLFyeg_IDWvOJmVES_HwyNXgSYA.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPYsxdbADdyap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPYsxdbEDdyap.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPYsxdb8Ddw.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPac2dbADdyap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPac2dbEDdyap.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPac2db8Ddw.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPcM3dbADdyap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPcM3dbEDdyap.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPcM3db8Ddw.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPd80dbADdyap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPd80dbEDdyap.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPd80db8Ddw.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPfs1dbADdyap.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPfs1dbEDdyap.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVKSTAyLFyeg_IDWvOJmVES_HwyPfs1db8Ddw.woff2',
			},
		},
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVNSTAyLFyeg_IDWvOJmVES_HRUNXcSYIAi.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVNSTAyLFyeg_IDWvOJmVES_HRUNXYSYIAi.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVNSTAyLFyeg_IDWvOJmVES_HRUNXgSYA.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HT4JG86Rb0bcw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HT4JG87Rb0bcw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HT4JG81Rb0.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HScJ286Rb0bcw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HScJ287Rb0bcw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HScJ281Rb0.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVPSTAyLFyeg_IDWvOJmVES_Hw4BXoKZA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVPSTAyLFyeg_IDWvOJmVES_Hw5BXoKZA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVPSTAyLFyeg_IDWvOJmVES_Hw3BXo.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HTEJm86Rb0bcw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HTEJm87Rb0bcw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HTEJm81Rb0.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HToIW86Rb0bcw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HToIW87Rb0bcw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HToIW81Rb0.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HSMIG86Rb0bcw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HSMIG87Rb0bcw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HSMIG81Rb0.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HSQI286Rb0bcw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HSQI287Rb0bcw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HSQI281Rb0.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HS0Im86Rb0bcw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HS0Im87Rb0bcw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HS0Im81Rb0.woff2',
			},
		},
	},
});

export const fontFamily = 'Be Vietnam Pro' as const;

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
