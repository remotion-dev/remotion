import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Prompt',
	importName: 'Prompt',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
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
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_7XJnvUD7dzB2KZeJ8flALfq0k.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_7XJnvUD7dzB2KZeJ8fksLfq0k.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_7XJnvUD7dzB2KZeJ8fkoLfq0k.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_7XJnvUD7dzB2KZeJ8fkQLfg.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLQb1M4W5Addw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLQb1MjW5Addw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLQb1MiW5Addw.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLQb1MsW5A.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK0bFM4W5Addw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK0bFMjW5Addw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK0bFMiW5Addw.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK0bFMsW5A.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2KZeoLTkYTeg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2KZeoQTkYTeg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2KZeoRTkYTeg.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2KZeofTkY.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLsbVM4W5Addw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLsbVMjW5Addw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLsbVMiW5Addw.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLsbVMsW5A.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLAalM4W5Addw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLAalMjW5Addw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLAalMiW5Addw.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeLAalMsW5A.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKka1M4W5Addw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKka1MjW5Addw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKka1MiW5Addw.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKka1MsW5A.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK4aFM4W5Addw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK4aFMjW5Addw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK4aFMiW5Addw.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeK4aFMsW5A.woff2',
			},
			'900': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKcaVM4W5Addw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKcaVMjW5Addw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKcaVMiW5Addw.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_6XJnvUD7dzB2KZeKcaVMsW5A.woff2',
			},
		},
		normal: {
			'100': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2CA-oLTkYTeg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2CA-oQTkYTeg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2CA-oRTkYTeg.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_9XJnvUD7dzB2CA-ofTkY.woff2',
			},
			'200': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cr_sIfWMuQ5Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cr_sIZmMuQ5Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cr_sIZ2MuQ5Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cr_sIaWMu.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cy_gIfWMuQ5Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cy_gIZmMuQ5Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cy_gIZ2MuQ5Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cy_gIaWMu.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W__XJnvUD7dzB2KdNodVkI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W__XJnvUD7dzB2Kb9odVkI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W__XJnvUD7dzB2KbtodVkI.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W__XJnvUD7dzB2KYNod.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Ck_kIfWMuQ5Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Ck_kIZmMuQ5Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Ck_kIZ2MuQ5Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Ck_kIaWMu.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cv_4IfWMuQ5Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cv_4IZmMuQ5Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cv_4IZ2MuQ5Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cv_4IaWMu.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C2_8IfWMuQ5Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C2_8IZmMuQ5Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C2_8IZ2MuQ5Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C2_8IaWMu.woff2',
			},
			'800': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cx_wIfWMuQ5Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cx_wIZmMuQ5Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cx_wIZ2MuQ5Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2Cx_wIaWMu.woff2',
			},
			'900': {
				thai: 'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C4_0IfWMuQ5Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C4_0IZmMuQ5Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C4_0IZ2MuQ5Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/prompt/v10/-W_8XJnvUD7dzB2C4_0IaWMu.woff2',
			},
		},
	},
});

export const fontFamily = 'Prompt' as const;

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
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
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
