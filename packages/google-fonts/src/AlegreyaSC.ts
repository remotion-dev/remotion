import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Alegreya SC',
	importName: 'AlegreyaSC',
	version: 'v25',
	url: 'https://fonts.googleapis.com/css2?family=Alegreya+SC:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400;1,500;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiMGmRtCJ62-O0HhNEa-Z6q6Z8RbZe_.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiMGmRtCJ62-O0HhNEa-Z6q6ZYRbZe_.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiMGmRtCJ62-O0HhNEa-Z6q6Z4RbZe_.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiMGmRtCJ62-O0HhNEa-Z6q6ZERbZe_.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiMGmRtCJ62-O0HhNEa-Z6q6Z0RbZe_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiMGmRtCJ62-O0HhNEa-Z6q6ZwRbZe_.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiMGmRtCJ62-O0HhNEa-Z6q6ZIRbQ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4WEyeKWeEVKD.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4WEyeKyeEVKD.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4WEyeKSeEVKD.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4WEyeKueEVKD.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4WEyeKeeEVKD.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4WEyeKaeEVKD.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4WEyeKieEQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4Sk0eKWeEVKD.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4Sk0eKyeEVKD.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4Sk0eKSeEVKD.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4Sk0eKueEVKD.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4Sk0eKeeEVKD.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4Sk0eKaeEVKD.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4Sk0eKieEQ.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4TU3eKWeEVKD.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4TU3eKyeEVKD.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4TU3eKSeEVKD.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4TU3eKueEVKD.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4TU3eKeeEVKD.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4TU3eKaeEVKD.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4TU3eKieEQ.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4RE2eKWeEVKD.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4RE2eKyeEVKD.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4RE2eKSeEVKD.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4RE2eKueEVKD.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4RE2eKeeEVKD.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4RE2eKaeEVKD.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiRGmRtCJ62-O0HhNEa-Z6q4RE2eKieEQ.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiOGmRtCJ62-O0HhNEa-Z6i2ZAJaQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiOGmRtCJ62-O0HhNEa-Z6r2ZAJaQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiOGmRtCJ62-O0HhNEa-Z6j2ZAJaQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiOGmRtCJ62-O0HhNEa-Z6s2ZAJaQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiOGmRtCJ62-O0HhNEa-Z6g2ZAJaQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiOGmRtCJ62-O0HhNEa-Z6h2ZAJaQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiOGmRtCJ62-O0HhNEa-Z6v2ZA.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZZc-oU7SKqGFQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZZc-oUySKqGFQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZZc-oU6SKqGFQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZZc-oU1SKqGFQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZZc-oU5SKqGFQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZZc-oU4SKqGFQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZZc-oU2SKo.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYU_IU7SKqGFQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYU_IUySKqGFQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYU_IU6SKqGFQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYU_IU1SKqGFQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYU_IU5SKqGFQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYU_IU4SKqGFQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYU_IU2SKo.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYI_4U7SKqGFQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYI_4UySKqGFQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYI_4U6SKqGFQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYI_4U1SKqGFQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYI_4U5SKqGFQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYI_4U4SKqGFQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYI_4U2SKo.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYs_oU7SKqGFQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYs_oUySKqGFQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYs_oU6SKqGFQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYs_oU1SKqGFQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYs_oU5SKqGFQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYs_oU4SKqGFQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasc/v25/taiTGmRtCJ62-O0HhNEa-ZYs_oU2SKo.woff2',
			},
		},
	},
});

export const fontFamily = 'Alegreya SC' as const;

type Variants = {
	italic: {
		weights: '400' | '500' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '400' | '500' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
